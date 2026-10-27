package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"CoreSync-backend/internal/service/stockcontrol" // [ADDED 2026-10-13]
	"context"
)

func (s *service) DeleteInventoryOrder(ctx context.Context, inventoryOrder *domain.InventoryOrder, actingClerkID string) (*domain.InventoryOrder, string, error) {
	// [ADDED 2026-10-13] a paid purchase request cannot be deleted
	var old struct {
		PrType string
		Status string
	}
	if err := s.db.WithContext(ctx).Raw(`SELECT COALESCE(pr_type,'') AS pr_type, status FROM inventory_orders WHERE id = ?`, inventoryOrder.ID).Scan(&old).Error; err != nil {
		return nil, "", err
	}
	if err := stockcontrol.CanDeleteOrder(old.PrType, old.Status); err != nil {
		return nil, "", err
	}
	deletedInventoryOrder, err := s.itemOrderRepo.DeleteInventoryOrder(ctx, inventoryOrder)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deletedInventoryOrder, actorName, nil
}
