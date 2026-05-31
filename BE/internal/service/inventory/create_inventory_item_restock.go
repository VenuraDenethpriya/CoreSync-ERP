package inventory

import (
	"context"
	"rims-backend/internal/service/domain"

	"gorm.io/gorm"
)

//	func (is *service) CreateInventoryItemRestock(ctx context.Context, inventoryItemRestock *domain.InventoryItemRestock) (*domain.InventoryItemRestock, error) {
//		return is.restockRepo.CreateInventoryItemRestock(ctx, inventoryItemRestock)
//	}
func (is *service) CreateInventoryItemRestock(ctx context.Context, restock *domain.InventoryItemRestock) (*domain.InventoryItemRestock, error) {

	err := is.db.Transaction(func(tx *gorm.DB) error {

		createdRestock, err := is.restockRepo.CreateInventoryItemRestock(ctx, tx, restock)
		if err != nil {
			return err
		}

		if err := is.itemRepo.GenerateAndCreateBatch(
			tx,
			createdRestock.ID,
			createdRestock.ItemID,
			createdRestock.ItemCode,
			createdRestock.Quantity,
		); err != nil {
			return err
		}

		return nil
	})

	return restock, err
}
