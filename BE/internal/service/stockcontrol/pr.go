// [ADDED 2026-10-13] Purchase requests (PRs). A PR is a row in the existing inventory_orders
// table (Inventory -> Orders) with pr_type set, so it also shows on the old Orders screen.
package stockcontrol

import (
	"context"
	"crypto/rand"
	"fmt"
	"strings"
	"time"

	"CoreSync-backend/internal/controller/http/dto"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PR struct {
	ID             uuid.UUID  `json:"id"`
	OrderNo        string     `json:"order_no"`
	PRType         string     `json:"pr_type"`
	Status         string     `json:"status"`
	InventoryID    *uuid.UUID `json:"inventory_id"`
	ItemCode       string     `json:"item_code"`
	ItemName       string     `json:"item_name"`
	OrderQuantity  int        `json:"order_quantity"`
	ReceivedQty    int        `json:"received_quantity"`
	Amount         float64    `json:"amount"`
	Reason         string     `json:"reason"`
	Supplier       string     `json:"supplier"`
	PurchasePhotos []string   `json:"purchase_photos"`
	CreatedBy      string     `json:"created_by"`
	CreatedByName  string     `json:"created_by_name"`
	CreatedAt      time.Time  `json:"created_at"`
	ApprovedBy     string     `json:"approved_by"`
	ApprovedAt     *time.Time `json:"approved_at"`
	RejectedReason string     `json:"rejected_reason"`
	PaidBy         string     `json:"paid_by"`
	PaidAt         *time.Time `json:"paid_at"`
	PaidOpen       int        `json:"paid_not_received"`
	Receipts       []Receipt  `json:"receipts,omitempty"`
}

type Receipt struct {
	ID          uuid.UUID `json:"id"`
	Quantity    int       `json:"quantity"`
	ReceivedBy  string    `json:"received_by"`
	GoodsPhotos []string  `json:"goods_photos"`
	ItemPhotos  []string  `json:"item_photos"`
	Remark      string    `json:"remark"`
	CreatedAt   time.Time `json:"created_at"`
}

type prRow struct {
	ID             uuid.UUID
	OrderNo        string
	PrType         string
	Status         string
	InventoryID    *uuid.UUID
	ItemCode       string
	ItemName       string
	OrderQuantity  int
	Quantity       int
	Amount         float64
	Reason         string
	Supplier       string
	PurchasePhotos []byte
	CreatedBy      string
	CreatedByName  string
	CreatedAt      time.Time
	ApprovedBy     string
	ApprovedAt     *time.Time
	RejectedReason string
	PaidBy         string
	PaidAt         *time.Time
	PaidQtyOpen    int
}

const prSelect = `SELECT o.id, o.order_no, COALESCE(o.pr_type,'') AS pr_type, o.status, o.inventory_id, o.item_code, o.item_name,
	o.order_quantity, o.quantity, o.amount, COALESCE(o.reason,'') AS reason, COALESCE(o.supplier,'') AS supplier, o.purchase_photos,
	o.created_by, COALESCE(TRIM(u.first_name || ' ' || u.last_name),'') AS created_by_name, o.created_at,
	COALESCE(o.approved_by,'') AS approved_by, o.approved_at, COALESCE(o.rejected_reason,'') AS rejected_reason,
	COALESCE(o.paid_by,'') AS paid_by, o.paid_at, o.paid_qty_open
	FROM inventory_orders o LEFT JOIN users u ON u.clerk_id = o.created_by`

func (r prRow) toPR() PR {
	return PR{ID: r.ID, OrderNo: r.OrderNo, PRType: r.PrType, Status: r.Status, InventoryID: r.InventoryID,
		ItemCode: r.ItemCode, ItemName: r.ItemName, OrderQuantity: r.OrderQuantity, ReceivedQty: r.Quantity,
		Amount: r.Amount, Reason: r.Reason, Supplier: r.Supplier, PurchasePhotos: parseList(r.PurchasePhotos),
		CreatedBy: r.CreatedBy, CreatedByName: r.CreatedByName, CreatedAt: r.CreatedAt, ApprovedBy: r.ApprovedBy,
		ApprovedAt: r.ApprovedAt, RejectedReason: r.RejectedReason, PaidBy: r.PaidBy, PaidAt: r.PaidAt, PaidOpen: r.PaidQtyOpen}
}

func lockPR(tx *gorm.DB, id uuid.UUID) (*prRow, error) {
	var r prRow
	if err := tx.Raw(prSelect+` WHERE o.id = ? FOR UPDATE OF o`, id).Scan(&r).Error; err != nil {
		return nil, err
	}
	if r.ID == uuid.Nil {
		return nil, refuse("purchase request not found")
	}
	if r.PrType == "" {
		return nil, refuse("this is an old stock order, not a purchase request")
	}
	return &r, nil
}

func newPRNo() string {
	b := make([]byte, 3)
	_, _ = rand.Read(b)
	return fmt.Sprintf("PR-%s-%X", time.Now().Format("0601"), b)
}

// ListPRs returns purchase requests, newest first. status "" = all.
func (s *Service) ListPRs(ctx context.Context, status, query string, limit, offset int) ([]PR, int64, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	where := ` WHERE o.pr_type IS NOT NULL`
	args := []any{}
	if status != "" {
		where += ` AND o.status = ?`
		args = append(args, status)
	}
	if q := strings.TrimSpace(query); q != "" {
		where += ` AND (o.item_code ILIKE ? OR o.item_name ILIKE ? OR o.order_no ILIKE ?)`
		args = append(args, "%"+q+"%", "%"+q+"%", "%"+q+"%")
	}
	var total int64
	if err := s.db.WithContext(ctx).Raw(`SELECT COUNT(*) FROM inventory_orders o`+where, args...).Scan(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []prRow
	err := s.db.WithContext(ctx).Raw(prSelect+where+` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`, append(args, limit, offset)...).Scan(&rows).Error
	if err != nil {
		return nil, 0, err
	}
	out := make([]PR, 0, len(rows))
	for _, r := range rows {
		out = append(out, r.toPR())
	}
	return out, total, nil
}

// GetPR returns one PR with its receipts.
func (s *Service) GetPR(ctx context.Context, id uuid.UUID) (*PR, error) {
	var r prRow
	if err := s.db.WithContext(ctx).Raw(prSelect+` WHERE o.id = ?`, id).Scan(&r).Error; err != nil {
		return nil, err
	}
	if r.ID == uuid.Nil {
		return nil, refuse("purchase request not found")
	}
	pr := r.toPR()
	var recs []struct {
		ID          uuid.UUID
		Quantity    int
		ReceivedBy  string
		GoodsPhotos []byte
		ItemPhotos  []byte
		Remark      string
		CreatedAt   time.Time
	}
	if err := s.db.WithContext(ctx).Raw(`SELECT id, quantity, received_by, goods_photos, item_photos, COALESCE(remark,'') AS remark, created_at
		FROM stock_receipts WHERE order_id = ? ORDER BY created_at`, id).Scan(&recs).Error; err != nil {
		return nil, err
	}
	for _, x := range recs {
		pr.Receipts = append(pr.Receipts, Receipt{ID: x.ID, Quantity: x.Quantity, ReceivedBy: x.ReceivedBy,
			GoodsPhotos: parseList(x.GoodsPhotos), ItemPhotos: parseList(x.ItemPhotos), Remark: x.Remark, CreatedAt: x.CreatedAt})
	}
	return &pr, nil
}

// CreatePRInput is a manual purchase request from the workshop.
type CreatePRInput struct {
	InventoryID    *uuid.UUID `json:"inventory_id"`  // an existing stock item, or
	NewItemCode    string     `json:"new_item_code"` // a new item (needs Eranja's approval)
	NewItemName    string     `json:"new_item_name"`
	Quantity       int        `json:"quantity"`
	Amount         float64    `json:"amount"` // estimated total cost
	Reason         string     `json:"reason"`
	Supplier       string     `json:"supplier"`
	PurchasePhotos []string   `json:"purchase_photos"`
}

// CreatePR: manual PR. Low item -> Approved at once; not low / new item -> Pending Approval (reason required).
func (s *Service) CreatePR(ctx context.Context, in CreatePRInput, actor string) (*PR, error) {
	if in.Quantity <= 0 {
		return nil, refuse("quantity must be more than 0")
	}
	if err := s.refuseIfHeld(ctx); err != nil {
		return nil, err
	}
	var id uuid.UUID
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		code, name := strings.TrimSpace(in.NewItemCode), strings.TrimSpace(in.NewItemName)
		isLow := false
		if in.InventoryID != nil && *in.InventoryID != uuid.Nil {
			it, err := lockItem(tx, *in.InventoryID)
			if err != nil {
				return err
			}
			code, name = it.ItemCode, it.ItemName
			var requested int
			if err := tx.Raw(`SELECT COALESCE(SUM(order_quantity),0) FROM inventory_orders
				WHERE inventory_id = ? AND status IN ('Draft','Pending Approval','Approved')`, it.ID).Scan(&requested).Error; err != nil {
				return err
			}
			free := FreeStock(it.QuantityInStock, it.QtyPaid, requested, int(it.Hold+0.999))
			isLow = it.LowLevel > 0 && free < it.LowLevel
		} else {
			if code == "" || name == "" {
				return refuse("choose a stock item, or give the new item's code and name")
			}
			var n int64
			if err := tx.Raw(`SELECT COUNT(*) FROM inventory WHERE item_code = ?`, code).Scan(&n).Error; err != nil {
				return err
			}
			if n > 0 {
				return refuse("item code %s already exists: choose it from the stock list", code)
			}
			in.InventoryID = nil
		}
		status, err := ManualPRStatus(isLow, in.Reason)
		if err != nil {
			return err
		}
		id = uuid.New()
		var approvedBy *string
		var approvedAt *time.Time
		if status == PRApproved {
			sys, now := "auto: item below low level", s.now()
			approvedBy, approvedAt = &sys, &now
		}
		return tx.Exec(`INSERT INTO inventory_orders (id, order_no, item_code, item_name, order_quantity, quantity, amount, status,
				order_date, created_by, created_at, updated_at, inventory_id, pr_type, reason, supplier, purchase_photos, approved_by, approved_at)
			VALUES (?,?,?,?,?,0,?,?,?,?,now(),now(),?,?,?,?,?::jsonb,?,?)`,
			id, newPRNo(), code, name, in.Quantity, in.Amount, status, s.now().Format("2006-01-02"), actor,
			in.InventoryID, PRTypeManual, strings.TrimSpace(in.Reason), strings.TrimSpace(in.Supplier),
			jsonList(cleanList(in.PurchasePhotos)), approvedBy, approvedAt).Error
	})
	if err != nil {
		return nil, err
	}
	pr, err := s.GetPR(ctx, id)
	if err == nil && pr.Status == PRPendingApproval { // [ADDED 2026-10-13] ask Eranja by email
		who := pr.CreatedByName
		if who == "" {
			who = pr.CreatedBy
		}
		s.askApproval("CoreSync: purchase request "+pr.OrderNo+" needs your approval", "A purchase request needs your approval:", []string{
			fmt.Sprintf("%s: %s %s, quantity %d, estimated LKR %.0f", pr.OrderNo, pr.ItemCode, pr.ItemName, pr.OrderQuantity, pr.Amount),
			"Reason: " + pr.Reason,
			"Raised by: " + who,
		})
	}
	return pr, err
}

// SubmitPR: an Admin checks an automatic draft (may change quantity/amount) and submits it -> Approved.
func (s *Service) SubmitPR(ctx context.Context, id uuid.UUID, qty *int, amount *float64, actor string) (*PR, error) {
	if err := s.refuseIfHeld(ctx); err != nil {
		return nil, err
	}
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		r, err := lockPR(tx, id)
		if err != nil {
			return err
		}
		if r.Status != PRDraft {
			return refuse("only a Draft purchase request can be submitted (this one is %s)", r.Status)
		}
		q, a := r.OrderQuantity, r.Amount
		if qty != nil {
			if *qty <= 0 {
				return refuse("quantity must be more than 0")
			}
			q = *qty
		}
		if amount != nil {
			a = *amount
		}
		return tx.Exec(`UPDATE inventory_orders SET status = ?, order_quantity = ?, amount = ?, approved_by = ?, approved_at = now(), updated_at = now()
			WHERE id = ?`, PRApproved, q, a, actor, id).Error
	})
	if err != nil {
		return nil, err
	}
	return s.GetPR(ctx, id)
}

// ApprovePR: Eranja approves a manual PR. A new item is added to the stock list now.
func (s *Service) ApprovePR(ctx context.Context, id uuid.UUID, actor string) (*PR, error) {
	if err := s.refuseIfHeld(ctx); err != nil { // [ADDED 2026-10-13]
		return nil, err
	}
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		r, err := lockPR(tx, id)
		if err != nil {
			return err
		}
		if r.Status != PRPendingApproval {
			return refuse("only a purchase request waiting for approval can be approved (this one is %s)", r.Status)
		}
		invID := r.InventoryID
		if invID == nil {
			newID := uuid.New()
			unit := 0.0
			if r.OrderQuantity > 0 {
				unit = r.Amount / float64(r.OrderQuantity)
			}
			if err := tx.Exec(`INSERT INTO inventory (id, item_code, item_name, quantity_in_stock, hold, unit_cost, threshold, status, product_id, created_by, created_at, updated_at)
				VALUES (?,?,?,0,0,?,0,'Out of Stock',?,?,now(),now())`, newID, r.ItemCode, r.ItemName, unit, uuid.Nil, actor).Error; err != nil {
				return err
			}
			invID = &newID
		}
		return tx.Exec(`UPDATE inventory_orders SET status = ?, inventory_id = ?, approved_by = ?, approved_at = now(), updated_at = now() WHERE id = ?`,
			PRApproved, invID, actor, id).Error
	})
	if err != nil {
		return nil, err
	}
	return s.GetPR(ctx, id)
}

// RejectPR: Eranja (manual PRs) or an Admin (automatic drafts) rejects a PR.
func (s *Service) RejectPR(ctx context.Context, id uuid.UUID, reason, actor string) (*PR, error) {
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		r, err := lockPR(tx, id)
		if err != nil {
			return err
		}
		if r.Status != PRPendingApproval && r.Status != PRDraft && r.Status != PRApproved {
			return refuse("a %s purchase request cannot be rejected", r.Status)
		}
		return tx.Exec(`UPDATE inventory_orders SET status = ?, rejected_reason = ?, approved_by = ?, approved_at = now(), updated_at = now() WHERE id = ?`,
			PRRejected, strings.TrimSpace(reason), actor, id).Error
	})
	if err != nil {
		return nil, err
	}
	return s.GetPR(ctx, id)
}

// MarkPaid: the Finance Head paid the supplier. Quantity goes into stage 1 (Paid).
func (s *Service) MarkPaid(ctx context.Context, id uuid.UUID, actor string) (*PR, error) {
	if err := s.refuseIfHeld(ctx); err != nil { // [ADDED 2026-10-13] restocking held too
		return nil, err
	}
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		r, err := lockPR(tx, id)
		if err != nil {
			return err
		}
		if r.Status != PRApproved {
			return refuse("only an Approved purchase request can be marked paid (this one is %s)", r.Status)
		}
		if r.InventoryID == nil {
			return refuse("purchase request has no stock item")
		}
		if _, err := lockItem(tx, *r.InventoryID); err != nil {
			return err
		}
		if err := tx.Exec(`UPDATE inventory SET qty_paid = qty_paid + ?, updated_at = now() WHERE id = ?`, r.OrderQuantity, *r.InventoryID).Error; err != nil {
			return err
		}
		if err := tx.Exec(`UPDATE inventory_orders SET status = ?, paid_by = ?, paid_at = now(), paid_qty_open = ?, updated_at = now() WHERE id = ?`,
			PRPaid, actor, r.OrderQuantity, id).Error; err != nil {
			return err
		}
		return ledger(tx, r.InventoryID, "PAID", r.OrderQuantity, "PR_PAID", "PR", id, r.OrderNo, actor)
	})
	if err != nil {
		return nil, err
	}
	return s.GetPR(ctx, id)
}

// ReceiveInput: goods arrived at the workshop.
type ReceiveInput struct {
	Quantity    int      `json:"quantity"`
	UnitCost    float64  `json:"unit_cost"`
	Codes       []string `json:"codes"` // unit barcodes if they have them; empty = CoreSync generates
	ReceivedBy  string   `json:"received_by"`
	GoodsPhotos []string `json:"goods_photos"` // timestamped photos of the goods received
	ItemPhotos  []string `json:"item_photos"`  // photos of the stock item / label
	Remark      string   `json:"remark"`
}

// Receive moves goods from Paid to Warehouse, using the existing receiving logic
// (stock, restock record, barcodes) and records who received them with photos.
func (s *Service) Receive(ctx context.Context, id uuid.UUID, in ReceiveInput, actor string) (*PR, error) {
	if in.Quantity <= 0 {
		return nil, refuse("quantity must be more than 0")
	}
	in.ReceivedBy = strings.TrimSpace(in.ReceivedBy)
	in.GoodsPhotos, in.ItemPhotos = cleanList(in.GoodsPhotos), cleanList(in.ItemPhotos)
	if in.ReceivedBy == "" {
		return nil, refuse("enter who received the goods")
	}
	if Enabled() && len(in.GoodsPhotos) == 0 {
		return nil, refuse("add at least one timestamped photo of the goods received")
	}
	if s.receive == nil {
		return nil, fmt.Errorf("stock control: receiver not wired")
	}
	if err := s.refuseIfHeld(ctx); err != nil { // [ADDED 2026-10-13] restocking held too
		return nil, err
	}
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		r, err := lockPR(tx, id)
		if err != nil {
			return err
		}
		if r.PaidAt == nil || (r.Status != PRPaid && !shippingStatuses[r.Status]) {
			return refuse("goods can only be received against a paid purchase request (this one is %s)", r.Status)
		}
		it, err := lockItem(tx, *r.InventoryID)
		if err != nil {
			return err
		}
		unit := in.UnitCost
		if unit <= 0 && r.OrderQuantity > 0 {
			unit = r.Amount / float64(r.OrderQuantity)
		}
		// existing receiving logic: stock + restock record + barcodes + order received quantity
		if _, err := s.receive(ctx, tx, &dto.CreateInventoryFromOrderRequest{
			OrderID: id, ItemCode: it.ItemCode, ItemName: it.ItemName, UnitCost: unit, Quantity: in.Quantity,
			Amount: unit * float64(in.Quantity), UserName: actor, Codes: in.Codes, Remark: in.Remark,
		}); err != nil {
			return err
		}
		// stage move: Paid -> Warehouse
		fromPaid := min(in.Quantity, r.PaidQtyOpen)
		if fromPaid > it.QtyPaid {
			fromPaid = it.QtyPaid
		}
		if err := tx.Exec(`UPDATE inventory SET qty_paid = qty_paid - ? WHERE id = ?`, fromPaid, it.ID).Error; err != nil {
			return err
		}
		received := r.Quantity + in.Quantity
		status := r.Status
		if received >= r.OrderQuantity {
			status = PRReceived
		}
		if err := tx.Exec(`UPDATE inventory_orders SET paid_qty_open = GREATEST(paid_qty_open - ?, 0), status = ?, updated_at = now() WHERE id = ?`,
			fromPaid, status, id).Error; err != nil {
			return err
		}
		if err := tx.Exec(`INSERT INTO stock_receipts (id, order_id, inventory_id, quantity, received_by, goods_photos, item_photos, remark, created_by)
			VALUES (?,?,?,?,?,?::jsonb,?::jsonb,?,?)`, uuid.New(), id, it.ID, in.Quantity, in.ReceivedBy,
			jsonList(in.GoodsPhotos), jsonList(in.ItemPhotos), strings.TrimSpace(in.Remark), actor).Error; err != nil {
			return err
		}
		if err := ledger(tx, &it.ID, "PAID", -fromPaid, "RECEIVED", "PR", id, r.OrderNo, actor); err != nil {
			return err
		}
		if err := ledger(tx, &it.ID, "WAREHOUSE", in.Quantity, "RECEIVED", "PR", id, r.OrderNo+" received by "+in.ReceivedBy, actor); err != nil {
			return err
		}
		return refreshStatus(tx, it.ID)
	})
	if err != nil {
		return nil, err
	}
	return s.GetPR(ctx, id)
}
