package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"context"

	"gorm.io/gorm"
)

//	func (is *service) CreateInventoryItemRestock(ctx context.Context, inventoryItemRestock *domain.InventoryItemRestock) (*domain.InventoryItemRestock, error) {
//		return is.restockRepo.CreateInventoryItemRestock(ctx, inventoryItemRestock)
//	}
// func (is *service) CreateInventoryItemRestock(ctx context.Context, restock *domain.InventoryItemRestock) (*domain.InventoryItemRestock, error) {

// 	err := is.db.Transaction(func(tx *gorm.DB) error {

// 		createdRestock, err := is.restockRepo.CreateInventoryItemRestock(ctx, tx, restock)
// 		if err != nil {
// 			return err
// 		}

// 		if err := is.itemRepo.GenerateAndCreateBatch(
// 			tx,
// 			createdRestock.ID,
// 			createdRestock.ItemID,
// 			createdRestock.ItemCode,
// 			createdRestock.Quantity,
// 		); err != nil {
// 			return err
// 		}

// 		return nil
// 	})

//		return restock, err
//	}
func (is *service) CreateInventoryItemRestock(ctx context.Context, restock *domain.InventoryItemRestock) (*domain.InventoryItemRestock, error) {

	var createdRestock *domain.InventoryItemRestock // Declare this outside the transaction to return it

	err := is.db.Transaction(func(tx *gorm.DB) error {

		var err error
		createdRestock, err = is.restockRepo.CreateInventoryItemRestock(ctx, tx, restock)
		if err != nil {
			return err
		}

		// Pass 'ctx' as the first argument here
		if err := is.itemRepo.GenerateAndCreateBatch(
			ctx, // <--- Add this argument
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

	if err != nil {
		return nil, err
	}

	return createdRestock, nil // Return the populated object, not the input 'restock'
}
