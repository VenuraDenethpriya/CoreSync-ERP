// [ADDED 2026-10-13] Inventory controls service.
//
// It owns the new tables (stock_receipts, pack_bom_lines, stock_ledger, stock_discrepancies,
// stock_counts, stock_count_lines) and the new columns on inventory / inventory_orders,
// and is called by:
//   - its own API (/api/v1/stock-control/...)
//   - the order service, when a pack is created, a pack status changes, or an order is Delivered
//   - the inventory service, to guard the old screens
//
// Existing tables keep their meaning: inventory.quantity_in_stock = goods physically here
// (Warehouse + Checked), inventory.hold = reserved for packs.
package stockcontrol

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/service/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Receiver books goods into stock exactly like the existing Received tab
// (stock, restock record, barcodes) inside the given transaction.
// Wired to inventory.Service.ReceiveInTx.
type Receiver func(ctx context.Context, tx *gorm.DB, req *dto.CreateInventoryFromOrderRequest) (*domain.Inventory, error)

// Hooks is what the order service calls.
type Hooks interface {
	SnapshotPackBOM(ctx context.Context, packID, productID uuid.UUID, packQty int) error
	OnPackChanged(ctx context.Context, packID uuid.UUID, actor string) error
	OnOrderChanged(ctx context.Context, orderID uuid.UUID, actor string) error
}

type Service struct {
	db      *gorm.DB
	receive Receiver
	now     func() time.Time
	mail    Mailer // [ADDED 2026-10-13] emails Eranja when something needs approval
}

// Mailer sends one email to the approver(s). Wired to the existing Resend client.
type Mailer func(subject, html string) error

// SetMailer turns on the approval emails.
func (s *Service) SetMailer(m Mailer) { s.mail = m }

func NewService(db *gorm.DB, receive Receiver) *Service {
	return &Service{db: db, receive: receive, now: time.Now}
}

var _ Hooks = (*Service)(nil)

// ---------------------------------------------------------------- helpers

func jsonList(v []string) string {
	if v == nil {
		v = []string{}
	}
	b, _ := json.Marshal(v)
	return string(b)
}

func parseList(b []byte) []string {
	var out []string
	_ = json.Unmarshal(b, &out)
	if out == nil {
		out = []string{}
	}
	return out
}

func cleanList(v []string) []string {
	var out []string
	for _, s := range v {
		if s = strings.TrimSpace(s); s != "" {
			out = append(out, s)
		}
	}
	return out
}

// ledger writes one stock_ledger row.
func ledger(tx *gorm.DB, inventoryID *uuid.UUID, stage string, qty int, reason, sourceType string, sourceID uuid.UUID, name, actor string) error {
	if qty == 0 {
		return nil
	}
	return tx.Exec(`INSERT INTO stock_ledger (id, inventory_id, stage, quantity, reason, source_type, source_id, name, created_by)
		VALUES (?,?,?,?,?,?,?,?,?)`, uuid.New(), inventoryID, stage, qty, reason, sourceType, sourceID, name, actor).Error
}

// StockRow is one stock item as the controls see it (exported so gorm can scan it when embedded).
type StockRow struct {
	ID              uuid.UUID
	ItemCode        string
	ItemName        string
	QuantityInStock int
	QtyPaid         int
	QtyChecked      int
	Hold            float64
	LowLevel        int
	UnitCost        float64
}

func lockItem(tx *gorm.DB, id uuid.UUID) (*StockRow, error) {
	var it StockRow
	err := tx.Raw(`SELECT id, item_code, item_name, quantity_in_stock, qty_paid, qty_checked, hold, low_level, unit_cost
		FROM inventory WHERE id = ? FOR UPDATE`, id).Scan(&it).Error
	if err != nil {
		return nil, err
	}
	if it.ID == uuid.Nil {
		return nil, refuse("stock item not found")
	}
	return &it, nil
}

// refreshStatus keeps the existing In Stock / Low Stock / Out of Stock label in step.
func refreshStatus(tx *gorm.DB, id uuid.UUID) error {
	return tx.Exec(`UPDATE inventory SET status = CASE
			WHEN quantity_in_stock <= 0 THEN 'Out of Stock'
			WHEN quantity_in_stock < GREATEST(threshold, low_level) THEN 'Low Stock'
			ELSE 'In Stock' END, updated_at = now()
		WHERE id = ?`, id).Error
}

// ---------------------------------------------------------------- hold

// HoldStatus: are purchase requests on hold because of the month-end count?
func (s *Service) HoldStatus(ctx context.Context) (bool, string, error) {
	now := s.now()
	var open int64
	if err := s.db.WithContext(ctx).Raw(`SELECT COUNT(*) FROM stock_counts WHERE status = 'OPEN'`).Scan(&open).Error; err != nil {
		return false, "", err
	}
	var st CountState
	if err := s.db.WithContext(ctx).Raw(`SELECT month, status FROM stock_counts WHERE month = ?`, now.Format("2006-01")).Scan(&st).Error; err != nil {
		return false, "", err
	}
	var pending int64
	if err := s.db.WithContext(ctx).Raw(`SELECT COUNT(*) FROM stock_discrepancies WHERE status = 'PENDING'`).Scan(&pending).Error; err != nil {
		return false, "", err
	}
	hold, msg := PRHold(now, st, open > 0, int(pending))
	return hold, msg, nil
}

func (s *Service) refuseIfHeld(ctx context.Context) error {
	hold, msg, err := s.HoldStatus(ctx)
	if err != nil {
		return err
	}
	if hold {
		return refuse("%s", msg)
	}
	return nil
}

// ---------------------------------------------------------------- stock list

type StockItem struct {
	ID                uuid.UUID `json:"id"`
	ItemCode          string    `json:"item_code"`
	ItemName          string    `json:"item_name"`
	Paid              int       `json:"paid"`      // stage 1
	Warehouse         int       `json:"warehouse"` // stage 2
	Checked           int       `json:"checked"`   // stage 3
	InStock           int       `json:"in_stock"`  // Warehouse + Checked
	Hold              float64   `json:"hold"`      // reserved for packs
	Requested         int       `json:"requested"` // in open purchase requests (not yet paid)
	LowLevel          int       `json:"low_level"`
	Free              int       `json:"free"`
	IsLow             bool      `json:"is_low"`
	PendingAdjustment int       `json:"pending_adjustment"` // excess(+)/shortage(-) waiting for approval
}

func (s *Service) ListStock(ctx context.Context, query string) ([]StockItem, error) {
	q := "%" + strings.TrimSpace(query) + "%"
	var rows []struct {
		StockRow
		Requested int
		Pending   int
	}
	err := s.db.WithContext(ctx).Raw(`
		SELECT i.id, i.item_code, i.item_name, i.quantity_in_stock, i.qty_paid, i.qty_checked, i.hold, i.low_level, i.unit_cost,
		  COALESCE((SELECT SUM(o.order_quantity) FROM inventory_orders o
		            WHERE o.inventory_id = i.id AND o.status IN ('Draft','Pending Approval','Approved')),0) AS requested,
		  COALESCE((SELECT SUM(d.quantity) FROM stock_discrepancies d
		            WHERE d.inventory_id = i.id AND d.status = 'PENDING'),0) AS pending
		FROM inventory i
		WHERE i.item_code ILIKE ? OR i.item_name ILIKE ?
		ORDER BY i.item_code`, q, q).Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	out := make([]StockItem, 0, len(rows))
	for _, r := range rows {
		free := FreeStock(r.QuantityInStock, r.QtyPaid, r.Requested, int(r.Hold+0.999))
		out = append(out, StockItem{
			ID: r.ID, ItemCode: r.ItemCode, ItemName: r.ItemName,
			Paid: r.QtyPaid, Warehouse: r.QuantityInStock - r.QtyChecked, Checked: r.QtyChecked,
			InStock: r.QuantityInStock, Hold: r.Hold, Requested: r.Requested, LowLevel: r.LowLevel,
			Free: free, IsLow: r.LowLevel > 0 && free < r.LowLevel, PendingAdjustment: r.Pending,
		})
	}
	return out, nil
}

// ---------------------------------------------------------------- ledger list

type LedgerRow struct {
	ID         uuid.UUID `json:"id"`
	ItemCode   string    `json:"item_code"`
	ItemName   string    `json:"item_name"`
	Stage      string    `json:"stage"`
	Quantity   int       `json:"quantity"`
	Reason     string    `json:"reason"`
	SourceType string    `json:"source_type"`
	SourceID   uuid.UUID `json:"source_id"`
	Name       string    `json:"name"`
	CreatedBy  string    `json:"created_by"`
	CreatedAt  time.Time `json:"created_at"`
}

func (s *Service) ListLedger(ctx context.Context, inventoryID, sourceID *uuid.UUID, limit, offset int) ([]LedgerRow, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	q := s.db.WithContext(ctx).Table("stock_ledger AS l").
		Select(`l.id, COALESCE(i.item_code,'') AS item_code, COALESCE(i.item_name,'') AS item_name, l.stage, l.quantity, l.reason,
			l.source_type, l.source_id, COALESCE(l.name,'') AS name, COALESCE(l.created_by,'') AS created_by, l.created_at`).
		Joins("LEFT JOIN inventory i ON i.id = l.inventory_id")
	if inventoryID != nil {
		q = q.Where("l.inventory_id = ?", *inventoryID)
	}
	if sourceID != nil {
		q = q.Where("l.source_id = ?", *sourceID)
	}
	var rows []LedgerRow
	err := q.Order("l.created_at DESC").Limit(limit).Offset(offset).Scan(&rows).Error
	return rows, err
}

// ---------------------------------------------------------------- checked stage

// Check moves goods from Warehouse to Checked when they are taken to work
// (barcode, box/bag label, shelf/bin label, or picked by item). Optional for now.
func (s *Service) Check(ctx context.Context, inventoryID uuid.UUID, qty int, method, code, actor string) error {
	if qty <= 0 {
		return refuse("quantity must be more than 0")
	}
	method = strings.ToUpper(strings.TrimSpace(method))
	switch method {
	case "BARCODE", "BATCH", "BIN", "MANUAL":
	default:
		return refuse("method must be BARCODE, BATCH, BIN or MANUAL")
	}
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		it, err := lockItem(tx, inventoryID)
		if err != nil {
			return err
		}
		if wh := it.QuantityInStock - it.QtyChecked; qty > wh {
			return refuse("only %d of %s are in Warehouse (not yet checked)", wh, it.ItemCode)
		}
		if err := tx.Exec(`UPDATE inventory SET qty_checked = qty_checked + ? WHERE id = ?`, qty, inventoryID).Error; err != nil {
			return err
		}
		src := uuid.New()
		name := method
		if code = strings.TrimSpace(code); code != "" {
			name += " " + code
		}
		if err := ledger(tx, &inventoryID, "WAREHOUSE", -qty, "CHECKED", "CHECK", src, name, actor); err != nil {
			return err
		}
		return ledger(tx, &inventoryID, "CHECKED", qty, "CHECKED", "CHECK", src, name, actor)
	})
}

// ---------------------------------------------------------------- finished packs

type FinishedPack struct {
	ProductID   uuid.UUID `json:"product_id"`
	ProductName string    `json:"product_name"`
	Packs       int       `json:"packs"`
}

// FinishedPacks: completed packs not yet delivered = finished-pack stock.
func (s *Service) FinishedPacks(ctx context.Context) ([]FinishedPack, error) {
	var rows []FinishedPack
	err := s.db.WithContext(ctx).Raw(`
		SELECT p.product_id, COALESCE(pr.name,'') AS product_name, SUM(GREATEST(p.quantity,1)) AS packs
		FROM order_items p LEFT JOIN products pr ON pr.product_id = p.product_id
		WHERE p.status = ? AND pr.category::text = 'BATTERY_PACK' GROUP BY p.product_id, pr.name ORDER BY pr.name`, PackCompleted).Scan(&rows).Error
	return rows, err
}
