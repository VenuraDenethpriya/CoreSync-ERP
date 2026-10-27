// [ADDED 2026-10-13] Automatic withdrawal: no manual allocation or usage.
//   - pack created   -> its BOM is copied onto the pack (later BOM edits do not change it)
//   - pack Completed -> BOM materials leave stock (Checked first, then Warehouse);
//     a shortfall becomes a shortage report; the pack is finished stock
//   - order Delivered -> its packs leave finished stock (completed first if they were not)
//   - moved back / deleted -> the withdrawal is reversed from the ledger
package stockcontrol

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type packRow struct {
	ID        uuid.UUID
	ProductID uuid.UUID
	Quantity  int
	Status    string
	SerialNo  string
	OrderNo   *uuid.UUID
	Category  string
}

type bomLine struct {
	InventoryID uuid.UUID
	Quantity    int
}

func lockPack(tx *gorm.DB, id uuid.UUID) (*packRow, error) {
	var p packRow
	err := tx.Raw(`SELECT p.id, p.product_id, p.quantity, COALESCE(p.status,'') AS status, COALESCE(p.serial_no,'') AS serial_no,
			p.order_no, COALESCE(pr.category::text,'') AS category
		FROM order_items p LEFT JOIN products pr ON pr.product_id = p.product_id
		WHERE p.id = ? FOR UPDATE OF p`, id).Scan(&p).Error
	if err != nil {
		return nil, err
	}
	if p.ID == uuid.Nil {
		return nil, nil
	}
	if p.Quantity <= 0 {
		p.Quantity = 1
	}
	return &p, nil
}

// SnapshotPackBOM copies the product's current BOM onto a new pack.
func (s *Service) SnapshotPackBOM(ctx context.Context, packID, productID uuid.UUID, packQty int) error {
	return snapshot(s.db.WithContext(ctx), packID, productID, packQty)
}

func snapshot(tx *gorm.DB, packID, productID uuid.UUID, packQty int) error {
	if packQty <= 0 {
		packQty = 1
	}
	return tx.Exec(`INSERT INTO pack_bom_lines (id, pack_id, product_id, inventory_id, quantity)
		SELECT gen_random_uuid(), ?, b.product_id, b.inventory_id, SUM(b.quantity) * ?
		FROM boms b WHERE b.product_id = ? GROUP BY b.product_id, b.inventory_id
		ON CONFLICT (pack_id, inventory_id) DO NOTHING`, packID, packQty, productID).Error
}

func packBOM(tx *gorm.DB, p *packRow) ([]bomLine, error) {
	var lines []bomLine
	if err := tx.Raw(`SELECT inventory_id, quantity FROM pack_bom_lines WHERE pack_id = ? ORDER BY inventory_id`, p.ID).Scan(&lines).Error; err != nil {
		return nil, err
	}
	if len(lines) == 0 { // pack made before this feature: copy today's BOM now
		if err := snapshot(tx, p.ID, p.ProductID, p.Quantity); err != nil {
			return nil, err
		}
		if err := tx.Raw(`SELECT inventory_id, quantity FROM pack_bom_lines WHERE pack_id = ? ORDER BY inventory_id`, p.ID).Scan(&lines).Error; err != nil {
			return nil, err
		}
	}
	return lines, nil
}

// completedState > 0 = this pack's withdrawal has been applied (and not reversed).
func completedState(tx *gorm.DB, packID uuid.UUID) (int, error) {
	var n int
	err := tx.Raw(`SELECT COALESCE(SUM(quantity),0) FROM stock_ledger
		WHERE source_type = 'PACK' AND source_id = ? AND stage = 'FINISHED' AND reason IN ('PACK_COMPLETED','PACK_REVERSED')`, packID).Scan(&n).Error
	return n, err
}

func deliveredState(tx *gorm.DB, packID uuid.UUID) (int, error) {
	var n int
	err := tx.Raw(`SELECT COALESCE(SUM(quantity),0) FROM stock_ledger
		WHERE source_type = 'PACK' AND source_id = ? AND stage = 'FINISHED' AND reason IN ('ORDER_DELIVERED','ORDER_UNDELIVERED')`, packID).Scan(&n).Error
	return n, err
}

// releaseReservation removes the pack's allocations for one item and lowers hold by the same amount.
func releaseReservation(tx *gorm.DB, packID, itemID uuid.UUID) error {
	var reserved int
	if err := tx.Raw(`SELECT COALESCE(SUM(count),0) FROM inventory_item_allocation WHERE pack_id = ? AND item_id = ?`, packID, itemID).Scan(&reserved).Error; err != nil {
		return err
	}
	if reserved == 0 {
		return nil
	}
	if err := tx.Exec(`DELETE FROM inventory_item_allocation WHERE pack_id = ? AND item_id = ?`, packID, itemID).Error; err != nil {
		return err
	}
	return tx.Exec(`UPDATE inventory SET hold = GREATEST(hold - ?, 0) WHERE id = ?`, reserved, itemID).Error
}

func withdrawPack(tx *gorm.DB, p *packRow, actor string) error {
	lines, err := packBOM(tx, p)
	if err != nil {
		return err
	}
	for _, l := range lines {
		it, err := lockItem(tx, l.InventoryID)
		if err != nil {
			return err
		}
		fc, fw, short := Split(l.Quantity, it.QtyChecked, it.QuantityInStock)
		if err := tx.Exec(`UPDATE inventory SET quantity_in_stock = quantity_in_stock - ?, qty_checked = qty_checked - ? WHERE id = ?`,
			fc+fw, fc, it.ID).Error; err != nil {
			return err
		}
		if err := releaseReservation(tx, p.ID, it.ID); err != nil {
			return err
		}
		if err := ledger(tx, &it.ID, "CHECKED", -fc, "PACK_COMPLETED", "PACK", p.ID, p.SerialNo, actor); err != nil {
			return err
		}
		if err := ledger(tx, &it.ID, "WAREHOUSE", -fw, "PACK_COMPLETED", "PACK", p.ID, p.SerialNo, actor); err != nil {
			return err
		}
		if short > 0 {
			if err := tx.Exec(`INSERT INTO stock_discrepancies (id, inventory_id, quantity, stock_effect, source_type, source_id, source_ref, explanation, created_by)
				VALUES (?,?,?,0,'PACK',?,?,?,?)`, uuid.New(), it.ID, -short, p.ID, p.SerialNo,
				fmt.Sprintf("Pack %s completed: its BOM needs %d of %s, only %d were in stock", p.SerialNo, l.Quantity, it.ItemCode, fc+fw),
				actor).Error; err != nil {
				return err
			}
		}
		if err := refreshStatus(tx, it.ID); err != nil {
			return err
		}
	}
	return ledger(tx, nil, "FINISHED", p.Quantity, "PACK_COMPLETED", "PACK", p.ID, p.SerialNo, actor)
}

func reversePack(tx *gorm.DB, packID uuid.UUID, p *packRow, finished int, actor string) error {
	var moves []struct {
		InventoryID uuid.UUID
		Stage       string
		Total       int
	}
	if err := tx.Raw(`SELECT inventory_id, stage, SUM(quantity) AS total FROM stock_ledger
		WHERE source_type = 'PACK' AND source_id = ? AND reason IN ('PACK_COMPLETED','PACK_REVERSED') AND stage IN ('CHECKED','WAREHOUSE')
		  AND inventory_id IS NOT NULL
		GROUP BY inventory_id, stage`, packID).Scan(&moves).Error; err != nil {
		return err
	}
	for _, m := range moves {
		if m.Total >= 0 {
			continue
		}
		back := -m.Total
		if _, err := lockItem(tx, m.InventoryID); err != nil {
			return err
		}
		checked := 0
		if m.Stage == "CHECKED" {
			checked = back
		}
		if err := tx.Exec(`UPDATE inventory SET quantity_in_stock = quantity_in_stock + ?, qty_checked = qty_checked + ? WHERE id = ?`,
			back, checked, m.InventoryID).Error; err != nil {
			return err
		}
		id := m.InventoryID
		if err := ledger(tx, &id, m.Stage, back, "PACK_REVERSED", "PACK", packID, "", actor); err != nil {
			return err
		}
		if err := refreshStatus(tx, id); err != nil {
			return err
		}
	}
	// shortages raised by this completion no longer apply
	if err := tx.Exec(`UPDATE stock_discrepancies SET status = 'REJECTED', admin_comment = 'Pack moved back from Completed; withdrawal reversed',
		decided_by = ?, decided_at = now() WHERE source_type = 'PACK' AND source_id = ? AND status = 'PENDING'`, actor, packID).Error; err != nil {
		return err
	}
	// reserve the materials again while the pack is still being built
	if p != nil && p.Status != PackCancelled {
		lines, err := packBOM(tx, p)
		if err != nil {
			return err
		}
		for _, l := range lines {
			if err := tx.Exec(`INSERT INTO inventory_item_allocation (id, item_id, pack_id, count, allocator, created_at) VALUES (?,?,?,?,?,now())`,
				uuid.New(), l.InventoryID, p.ID, l.Quantity, actor).Error; err != nil {
				return err
			}
			if err := tx.Exec(`UPDATE inventory SET hold = hold + ? WHERE id = ?`, l.Quantity, l.InventoryID).Error; err != nil {
				return err
			}
		}
	}
	return ledger(tx, nil, "FINISHED", -finished, "PACK_REVERSED", "PACK", packID, "", actor)
}

// OnPackChanged runs after a pack's status changes or the pack is deleted.
func (s *Service) OnPackChanged(ctx context.Context, packID uuid.UUID, actor string) error {
	if !Enabled() {
		return nil
	}
	since := s.dbNow(ctx)
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return applyPack(tx, packID, actor)
	})
	if err == nil {
		s.emailNewReports(ctx, since, "CoreSync: shortage at pack completion needs your approval")
	}
	return err
}

func applyPack(tx *gorm.DB, packID uuid.UUID, actor string) error {
	p, err := lockPack(tx, packID)
	if err != nil {
		return err
	}
	done, err := completedState(tx, packID)
	if err != nil {
		return err
	}
	if p == nil { // deleted
		if done > 0 {
			return reversePack(tx, packID, nil, done, actor)
		}
		return nil
	}
	if p.Category != "" && p.Category != "BATTERY_PACK" {
		return nil
	}
	want := p.Status == PackCompleted || p.Status == PackDelivered
	switch {
	case want && done == 0:
		return withdrawPack(tx, p, actor)
	case !want && done > 0:
		return reversePack(tx, packID, p, done, actor)
	case p.Status == PackCancelled && done == 0:
		lines, err := packBOM(tx, p)
		if err != nil {
			return err
		}
		for _, l := range lines {
			if err := releaseReservation(tx, p.ID, l.InventoryID); err != nil {
				return err
			}
		}
	}
	return nil
}

// OnOrderChanged runs after an order's status changes or the order is edited/deleted.
// Delivered: every pack of the order is completed (if it was not) and leaves finished stock.
// Moved away from Delivered: the packs go back to finished stock (Completed).
func (s *Service) OnOrderChanged(ctx context.Context, orderID uuid.UUID, actor string) error {
	if !Enabled() {
		return nil
	}
	since := s.dbNow(ctx)
	defer s.emailNewReports(ctx, since, "CoreSync: shortage at delivery needs your approval")
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var status string
		if err := tx.Raw(`SELECT COALESCE(order_status,'') FROM orders WHERE order_id = ? FOR UPDATE`, orderID).Scan(&status).Error; err != nil {
			return err
		}
		var packIDs []uuid.UUID
		if err := tx.Raw(`SELECT p.id FROM order_items p JOIN products pr ON pr.product_id = p.product_id
			WHERE p.order_no = ? AND pr.category::text = 'BATTERY_PACK' ORDER BY p.id`, orderID).Scan(&packIDs).Error; err != nil {
			return err
		}
		for _, id := range packIDs {
			p, err := lockPack(tx, id)
			if err != nil || p == nil {
				if err != nil {
					return err
				}
				continue
			}
			delivered, err := deliveredState(tx, id)
			if err != nil {
				return err
			}
			if status == OrderDelivered && p.Status != PackCancelled && delivered == 0 {
				// a pack delivered without being marked Completed is completed now
				if done, err := completedState(tx, id); err != nil {
					return err
				} else if done == 0 {
					if err := withdrawPack(tx, p, actor); err != nil {
						return err
					}
				}
				if err := tx.Exec(`UPDATE order_items SET status = ? WHERE id = ?`, PackDelivered, id).Error; err != nil {
					return err
				}
				if err := ledger(tx, nil, "FINISHED", -p.Quantity, "ORDER_DELIVERED", "PACK", id, p.SerialNo, actor); err != nil {
					return err
				}
			}
			if status != OrderDelivered && delivered < 0 {
				if err := tx.Exec(`UPDATE order_items SET status = ? WHERE id = ?`, PackCompleted, id).Error; err != nil {
					return err
				}
				if err := ledger(tx, nil, "FINISHED", -delivered, "ORDER_UNDELIVERED", "PACK", id, p.SerialNo, actor); err != nil {
					return err
				}
			}
		}
		return nil
	})
}
