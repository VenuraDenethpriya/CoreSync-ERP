package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"CoreSync-backend/internal/service/stockcontrol" // [ADDED 2026-10-13]
	"context"

	"gorm.io/gorm"
)

//	func (s *service) CreateInventory(ctx context.Context, inventory *domain.Inventory) (*domain.Inventory, error) {
//		return s.repo.CreateInventory(ctx, inventory)
//	}
func (s *service) CreateInventory(ctx context.Context, inventory *domain.Inventory) (*domain.Inventory, error) {
	var createdInventory *domain.Inventory

	// Wrap the repository call in a transaction
	// [ADDED 2026-10-13] with inventory controls on, a new item starts at 0: stock comes in
	// only through a paid purchase request.
	if stockcontrol.Enabled() {
		inventory.QuantityInStock = 0
	}
	err := s.db.Transaction(func(tx *gorm.DB) error {
		var err error
		// Pass 'tx' to the repository
		createdInventory, err = s.repo.CreateInventory(ctx, tx, inventory)
		return err
	})

	if err != nil {
		return nil, err
	}

	return createdInventory, nil
}
