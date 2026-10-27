package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"CoreSync-backend/internal/service/stockcontrol" // [ADDED 2026-10-13]
	"context"

	"gorm.io/gorm"
)

func (s *service) UpdateInventory(ctx context.Context, inventory *domain.Inventory, actingClerkID string) (*domain.Inventory, string, error) {
	var updatedInventory *domain.Inventory

	err := s.db.Transaction(func(tx *gorm.DB) error {
		var err error
		// [ADDED 2026-10-13] with inventory controls on, the quantity cannot be typed over:
		// differences go through an excess/shortage report approved by Eranja.
		if stockcontrol.Enabled() {
			var current int
			if err := tx.Raw(`SELECT quantity_in_stock FROM inventory WHERE id = ?`, inventory.ID).Scan(&current).Error; err != nil {
				return err
			}
			inventory.QuantityInStock = current
		}
		updatedInventory, _, err = s.repo.UpdateInventory(ctx, tx, inventory, actingClerkID)
		return err
	})

	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}

	actorName := actor.FirstName + " " + actor.LastName
	return updatedInventory, actorName, nil
}
