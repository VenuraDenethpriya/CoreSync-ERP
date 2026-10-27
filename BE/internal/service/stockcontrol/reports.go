// [ADDED 2026-10-13] Excess/shortage reports, the month-end count and the low-level check.
package stockcontrol

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ================================================================ excess / shortage

type Discrepancy struct {
	ID             uuid.UUID  `json:"id"`
	InventoryID    uuid.UUID  `json:"inventory_id"`
	ItemCode       string     `json:"item_code"`
	ItemName       string     `json:"item_name"`
	Quantity       int        `json:"quantity"`     // + excess, - shortage
	StockEffect    int        `json:"stock_effect"` // what approval changes in stock
	SourceType     string     `json:"source_type"`
	SourceRef      string     `json:"source_ref"`
	Explanation    string     `json:"explanation"`
	AdminComment   string     `json:"admin_comment"`
	Status         string     `json:"status"`
	AdjustmentName string     `json:"adjustment_name"`
	DecidedBy      string     `json:"decided_by"`
	DecidedAt      *time.Time `json:"decided_at"`
	CreatedAt      time.Time  `json:"created_at"`
}

func (s *Service) ListDiscrepancies(ctx context.Context, status string) ([]Discrepancy, error) {
	q := s.db.WithContext(ctx).Table("stock_discrepancies AS d").
		Select(`d.id, d.inventory_id, i.item_code, i.item_name, d.quantity, d.stock_effect, d.source_type, COALESCE(d.source_ref,'') AS source_ref,
			COALESCE(d.explanation,'') AS explanation, COALESCE(d.admin_comment,'') AS admin_comment, d.status,
			COALESCE(d.adjustment_name,'') AS adjustment_name, COALESCE(d.decided_by,'') AS decided_by, d.decided_at, d.created_at`).
		Joins("JOIN inventory i ON i.id = d.inventory_id")
	if status != "" {
		q = q.Where("d.status = ?", strings.ToUpper(status))
	}
	var rows []Discrepancy
	err := q.Order("d.created_at DESC").Limit(500).Scan(&rows).Error
	return rows, err
}

// ReportDiscrepancy: an Admin reports an excess/shortage found outside the count (e.g. damaged goods).
func (s *Service) ReportDiscrepancy(ctx context.Context, inventoryID uuid.UUID, qty int, explanation, actor string) error {
	if qty == 0 {
		return refuse("quantity must not be 0 (use + for excess, - for shortage)")
	}
	if strings.TCoreSyncpace(explanation) == "" {
		return refuse("explain what happened to the goods")
	}
	since := s.dbNow(ctx)
	if err := s.db.WithContext(ctx).Exec(`INSERT INTO stock_discrepancies (id, inventory_id, quantity, stock_effect, source_type, explanation, created_by)
		VALUES (?,?,?,?,'OTHER',?,?)`, uuid.New(), inventoryID, qty, qty, strings.TCoreSyncpace(explanation), actor).Error; err != nil {
		return err
	}
	s.emailNewReports(ctx, since, "CoreSync: excess/shortage reported, needs your approval") // [ADDED 2026-10-13]
	return nil
}

// CommentDiscrepancy: an Admin explains the difference before Eranja decides.
func (s *Service) CommentDiscrepancy(ctx context.Context, id uuid.UUID, comment, actor string) error {
	if strings.TCoreSyncpace(comment) == "" {
		return refuse("comment is empty")
	}
	res := s.db.WithContext(ctx).Exec(`UPDATE stock_discrepancies SET admin_comment = ? WHERE id = ? AND status = 'PENDING'`, strings.TCoreSyncpace(comment), id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return refuse("report not found or already decided")
	}
	return nil
}

// DecideDiscrepancy: Eranja approves (stock is balanced under a named adjustment) or rejects.
func (s *Service) DecideDiscrepancy(ctx context.Context, id uuid.UUID, approve bool, actor string) error {
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var d struct {
			ID          uuid.UUID
			InventoryID uuid.UUID
			Quantity    int
			StockEffect int
			SourceType  string
			Status      string
		}
		if err := tx.Raw(`SELECT id, inventory_id, quantity, stock_effect, source_type, status FROM stock_discrepancies WHERE id = ? FOR UPDATE`, id).Scan(&d).Error; err != nil {
			return err
		}
		if d.ID == uuid.Nil {
			return refuse("report not found")
		}
		if d.Status != "PENDING" {
			return refuse("report already %s", strings.ToLower(d.Status))
		}
		if !approve {
			return tx.Exec(`UPDATE stock_discrepancies SET status = 'REJECTED', decided_by = ?, decided_at = now() WHERE id = ?`, actor, id).Error
		}
		name := AdjustmentName(d.Quantity, d.SourceType, s.now())
		if d.StockEffect != 0 {
			it, err := lockItem(tx, d.InventoryID)
			if err != nil {
				return err
			}
			effect := d.StockEffect
			if it.QuantityInStock+effect < 0 {
				effect = -it.QuantityInStock
			}
			// a shortage comes out of Warehouse first, then Checked
			checkedCut := 0
			if wh := it.QuantityInStock - it.QtyChecked; effect < 0 && -effect > wh {
				checkedCut = -effect - wh
			}
			if err := tx.Exec(`UPDATE inventory SET quantity_in_stock = quantity_in_stock + ?, qty_checked = qty_checked - ? WHERE id = ?`,
				effect, checkedCut, it.ID).Error; err != nil {
				return err
			}
			if err := ledger(tx, &it.ID, "WAREHOUSE", effect+checkedCut, "ADJUSTMENT", "DISCREPANCY", id, name, actor); err != nil {
				return err
			}
			if err := ledger(tx, &it.ID, "CHECKED", -checkedCut, "ADJUSTMENT", "DISCREPANCY", id, name, actor); err != nil {
				return err
			}
			if err := refreshStatus(tx, it.ID); err != nil {
				return err
			}
		}
		return tx.Exec(`UPDATE stock_discrepancies SET status = 'APPROVED', adjustment_name = ?, decided_by = ?, decided_at = now() WHERE id = ?`,
			name, actor, id).Error
	})
}

// ================================================================ month-end count

type Count struct {
	ID       uuid.UUID   `json:"id"`
	Month    string      `json:"month"`
	Status   string      `json:"status"`
	OpenedBy string      `json:"opened_by"`
	OpenedAt time.Time   `json:"opened_at"`
	ClosedAt *time.Time  `json:"closed_at"`
	Lines    []CountItem `json:"lines" gorm:"-"`
}

type CountItem struct {
	ID           uuid.UUID `json:"id"`
	InventoryID  uuid.UUID `json:"inventory_id"`
	ItemCode     string    `json:"item_code"`
	ItemName     string    `json:"item_name"`
	SystemQty    int       `json:"system_qty"`
	CountedQty   *int      `json:"counted_qty"`
	Difference   *int      `json:"difference"`
	AdminComment string    `json:"admin_comment"`
}

// CurrentCount returns the open count, else the latest one (nil if none yet).
func (s *Service) CurrentCount(ctx context.Context) (*Count, error) {
	var c Count
	err := s.db.WithContext(ctx).Raw(`SELECT id, month, status, COALESCE(opened_by,'') AS opened_by, opened_at, closed_at FROM stock_counts
		ORDER BY (status = 'OPEN') DESC, opened_at DESC LIMIT 1`).Scan(&c).Error
	if err != nil || c.ID == uuid.Nil {
		return nil, err
	}
	err = s.db.WithContext(ctx).Raw(`SELECT l.id, l.inventory_id, i.item_code, i.item_name, l.system_qty, l.counted_qty,
			CASE WHEN l.counted_qty IS NULL THEN NULL ELSE l.counted_qty - l.system_qty END AS difference,
			COALESCE(l.admin_comment,'') AS admin_comment
		FROM stock_count_lines l JOIN inventory i ON i.id = l.inventory_id WHERE l.count_id = ? ORDER BY i.item_code`, c.ID).Scan(&c.Lines).Error
	return &c, err
}

// OpenCount: on/after the start day (25th), the line supervisor opens this month's count.
// It lists every stock item with its CoreSync quantity (Warehouse + Checked) at this moment.
func (s *Service) OpenCount(ctx context.Context, actor string) (*Count, error) {
	now := s.now()
	if now.Day() < CountStartDay() {
		return nil, refuse("the month-end count opens on the %dth", CountStartDay())
	}
	month := now.Format("2006-01")
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var n int64
		if err := tx.Raw(`SELECT COUNT(*) FROM stock_counts WHERE month = ?`, month).Scan(&n).Error; err != nil {
			return err
		}
		if n > 0 {
			return refuse("the count for %s already exists", now.Format("Jan 2006"))
		}
		id := uuid.New()
		if err := tx.Exec(`INSERT INTO stock_counts (id, month, status, opened_by) VALUES (?,?,'OPEN',?)`, id, month, actor).Error; err != nil {
			return err
		}
		return tx.Exec(`INSERT INTO stock_count_lines (id, count_id, inventory_id, system_qty)
			SELECT gen_random_uuid(), ?, i.id, i.quantity_in_stock FROM inventory i`, id).Error
	})
	if err != nil {
		return nil, err
	}
	return s.CurrentCount(ctx)
}

func (s *Service) openLine(tx *gorm.DB, lineID uuid.UUID) error {
	var st string
	if err := tx.Raw(`SELECT c.status FROM stock_count_lines l JOIN stock_counts c ON c.id = l.count_id WHERE l.id = ?`, lineID).Scan(&st).Error; err != nil {
		return err
	}
	if st != "OPEN" {
		return refuse("this count is not open")
	}
	return nil
}

// EnterCount: the line supervisor enters the physical quantity for one item.
func (s *Service) EnterCount(ctx context.Context, lineID uuid.UUID, counted int, actor string) error {
	if counted < 0 {
		return refuse("counted quantity cannot be negative")
	}
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := s.openLine(tx, lineID); err != nil {
			return err
		}
		return tx.Exec(`UPDATE stock_count_lines SET counted_qty = ?, counted_by = ? WHERE id = ?`, counted, actor, lineID).Error
	})
}

// CommentCountLine: an Admin comments on a difference.
func (s *Service) CommentCountLine(ctx context.Context, lineID uuid.UUID, comment, actor string) error {
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := s.openLine(tx, lineID); err != nil {
			return err
		}
		return tx.Exec(`UPDATE stock_count_lines SET admin_comment = ?, commented_by = ? WHERE id = ?`, strings.TCoreSyncpace(comment), actor, lineID).Error
	})
}

// CloseCount: everything counted and every difference commented -> the count closes,
// each difference becomes an excess/shortage report for Eranja, and PRs are released.
func (s *Service) CloseCount(ctx context.Context, countID uuid.UUID, actor string) (*Count, error) {
	since := s.dbNow(ctx)
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var c struct {
			ID     uuid.UUID
			Month  string
			Status string
		}
		if err := tx.Raw(`SELECT id, month, status FROM stock_counts WHERE id = ? FOR UPDATE`, countID).Scan(&c).Error; err != nil {
			return err
		}
		if c.ID == uuid.Nil || c.Status != "OPEN" {
			return refuse("this count is not open")
		}
		var lines []struct {
			InventoryID  uuid.UUID
			ItemCode     string
			SystemQty    int
			CountedQty   *int
			AdminComment string
		}
		if err := tx.Raw(`SELECT l.inventory_id, i.item_code, l.system_qty, l.counted_qty, COALESCE(l.admin_comment,'') AS admin_comment
			FROM stock_count_lines l JOIN inventory i ON i.id = l.inventory_id WHERE l.count_id = ?`, countID).Scan(&lines).Error; err != nil {
			return err
		}
		check := make([]CountLine, 0, len(lines))
		for _, l := range lines {
			check = append(check, CountLine{ItemCode: l.ItemCode, SystemQty: l.SystemQty, CountedQty: l.CountedQty, Comment: l.AdminComment})
		}
		if err := CanCloseCount(check); err != nil {
			return err
		}
		for _, l := range lines {
			diff := *l.CountedQty - l.SystemQty
			if diff == 0 {
				continue
			}
			if err := tx.Exec(`INSERT INTO stock_discrepancies (id, inventory_id, quantity, stock_effect, source_type, source_id, source_ref, explanation, created_by)
				VALUES (?,?,?,?,'COUNT',?,?,?,?)`, uuid.New(), l.InventoryID, diff, diff, countID, "Count "+c.Month,
				fmt.Sprintf("Counted %d, CoreSync showed %d. Admin: %s", *l.CountedQty, l.SystemQty, l.AdminComment), actor).Error; err != nil {
				return err
			}
		}
		return tx.Exec(`UPDATE stock_counts SET status = 'CLOSED', closed_by = ?, closed_at = now() WHERE id = ?`, actor, countID).Error
	})
	if err != nil {
		return nil, err
	}
	// [ADDED 2026-10-13] purchasing and restocking stay on hold until Eranja approves these
	s.emailNewReports(ctx, since, "CoreSync: month-end count differences need your approval")
	return s.CurrentCount(ctx)
}

// ================================================================ low-level check

type LowLevelResult struct {
	ItemsUpdated int      `json:"items_updated"`
	DraftsMade   []string `json:"drafts_made"` // item codes
	OnHold       bool     `json:"on_hold"`
	HoldReason   string   `json:"hold_reason,omitempty"`
}

// RunLowLevel recalculates every item's low level from the BOMs and drafts automatic PRs
// for items below it (unless PRs are on hold or a PR for the item is already open).
func (s *Service) RunLowLevel(ctx context.Context, actor string) (*LowLevelResult, error) {
	res := &LowLevelResult{}
	hold, msg, err := s.HoldStatus(ctx)
	if err != nil {
		return nil, err
	}
	res.OnHold, res.HoldReason = hold, msg
	err = s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var needs []struct {
			InventoryID uuid.UUID
			ProductID   uuid.UUID
			Quantity    int
		}
		if err := tx.Raw(`SELECT inventory_id, product_id, SUM(quantity) AS quantity FROM boms GROUP BY inventory_id, product_id`).Scan(&needs).Error; err != nil {
			return err
		}
		byItem := map[uuid.UUID][]BomNeed{}
		for _, n := range needs {
			byItem[n.InventoryID] = append(byItem[n.InventoryID], BomNeed{ProductID: n.ProductID.String(), PerPack: n.Quantity})
		}
		var items []struct {
			StockRow
			Requested int
		}
		if err := tx.Raw(`SELECT i.id, i.item_code, i.item_name, i.quantity_in_stock, i.qty_paid, i.qty_checked, i.hold, i.low_level, i.unit_cost,
			COALESCE((SELECT SUM(o.order_quantity) FROM inventory_orders o
			          WHERE o.inventory_id = i.id AND o.status IN ('Draft','Pending Approval','Approved')),0) AS requested
			FROM inventory i ORDER BY i.item_code FOR UPDATE OF i`).Scan(&items).Error; err != nil {
			return err
		}
		for _, it := range items {
			low := LowLevel(byItem[it.ID], LowLevelPacks())
			reorder := LowLevel(byItem[it.ID], ReorderPacks())
			if low != it.LowLevel {
				if err := tx.Exec(`UPDATE inventory SET low_level = ?, threshold = ? WHERE id = ?`, low, low, it.ID).Error; err != nil {
					return err
				}
				res.ItemsUpdated++
			}
			if hold || it.Requested > 0 {
				continue // a PR for this item is already open
			}
			free := FreeStock(it.QuantityInStock, it.QtyPaid, it.Requested, int(math.Ceil(it.Hold)))
			qty := AutoPRQuantity(free, low, reorder)
			if qty <= 0 {
				continue
			}
			if err := tx.Exec(`INSERT INTO inventory_orders (id, order_no, item_code, item_name, order_quantity, quantity, amount, status,
					order_date, created_by, created_at, updated_at, inventory_id, pr_type, reason)
				VALUES (?,?,?,?,?,0,?,?,?,?,now(),now(),?,?,?)`,
				uuid.New(), newPRNo(), it.ItemCode, it.ItemName, qty, float64(qty)*it.UnitCost, PRDraft, s.now().Format("2006-01-02"),
				actor, it.ID, PRTypeAuto,
				fmt.Sprintf("Below low level: %d free (in stock %d + paid %d - reserved %.0f), low level %d (%d packs). Ordering up to %d (%d packs).",
					free, it.QuantityInStock, it.QtyPaid, it.Hold, low, LowLevelPacks(), reorder, ReorderPacks())).Error; err != nil {
				return err
			}
			res.DraftsMade = append(res.DraftsMade, it.ItemCode)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return res, nil
}

// StartDailyLowLevel runs the low-level check once a day (first run 2 minutes after start).
// created_by on automatic drafts = STOCK_SYSTEM_CLERK_ID if set (a CoreSync user), else "system".
func (s *Service) StartDailyLowLevel(ctx context.Context, actor string, logf func(string, ...any)) {
	go func() {
		timer := time.NewTimer(2 * time.Minute)
		defer timer.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-timer.C:
				if res, err := s.RunLowLevel(ctx, actor); err != nil {
					logf("stock control: low-level check failed: %v", err)
				} else if len(res.DraftsMade) > 0 || res.ItemsUpdated > 0 {
					logf("stock control: low levels updated for %d items, drafts for %v (hold=%v)", res.ItemsUpdated, res.DraftsMade, res.OnHold)
				}
				timer.Reset(24 * time.Hour)
			}
		}
	}()
}
