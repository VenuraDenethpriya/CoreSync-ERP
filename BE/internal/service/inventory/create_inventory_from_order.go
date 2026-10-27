package inventory

import (
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/service/domain"
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (s *service) CreateInventoryFromOrders(ctx context.Context, req *dto.CreateInventoryFromOrderRequest) (*domain.Inventory, error) {
	var inventory *domain.Inventory
	err := s.db.Transaction(func(tx *gorm.DB) error {
		var err error
		inventory, err = s.ReceiveInTx(ctx, tx, req)
		return err
	})
	return inventory, err
}

// [CHANGED 2026-10-13] The body of CreateInventoryFromOrders moved here unchanged, so the
// stock-control purchase request receipt can run it inside its own transaction.
func (s *service) ReceiveInTx(ctx context.Context, tx *gorm.DB, req *dto.CreateInventoryFromOrderRequest) (*domain.Inventory, error) {
	var inventory *domain.Inventory

	err := func() error {
		inv, err := s.repo.FindByCodeAndName(ctx, tx, req.ItemCode, req.ItemName)

		if err == gorm.ErrRecordNotFound {
			newInv := &domain.Inventory{
				ItemCode:        req.ItemCode,
				ItemName:        req.ItemName,
				QuantityInStock: req.Quantity,
				UnitCost:        req.UnitCost,
				CreatedBy:       req.UserName,
				Status:          "In Stock",
			}
			inventory, err = s.repo.CreateInventory(ctx, tx, newInv)
			if err != nil {
				return err
			}

		} else if err != nil {
			return err
		} else {
			inventory = inv

			inventory.QuantityInStock += req.Quantity

			if float64(inventory.QuantityInStock) > inventory.Threshold {
				inventory.Status = "In Stock"
			}

			_, _, err = s.repo.UpdateInventory(ctx, tx, inventory, req.UserName)
			if err != nil {
				return err
			}
		}

		restock := &domain.InventoryItemRestock{
			ItemID:    inventory.ID,
			OrderID:   req.OrderID,
			UnitPrice: req.UnitCost,
			Quantity:  req.Quantity,
			Amount:    req.Amount,
			UserName:  req.UserName,
			Remark:    req.Remark,
		}

		createdRestock, err := s.restockRepo.CreateInventoryItemRestock(ctx, tx, restock)
		if err != nil {
			return err
		}
		if req.OrderID != uuid.Nil {
			err = s.itemOrderRepo.IncrementOrderQuantity(ctx, tx, req.OrderID, req.Quantity)
			if err != nil {
				return err
			}
		}

		if len(req.Codes) > 0 {
			err = s.itemRepo.SaveItems(ctx, tx, createdRestock.ID, inventory.ID, req.Codes)
		} else {
			err = s.itemRepo.GenerateAndCreateBatch(ctx, tx, createdRestock.ID, inventory.ID, inventory.ItemCode, req.Quantity)
		}

		return err
	}()

	return inventory, err
}
