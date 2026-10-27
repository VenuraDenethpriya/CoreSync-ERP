package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"CoreSync-backend/internal/service/stockcontrol" // [ADDED 2026-10-13]
	"context"
)

func (s *service) UpdateInventoryOrder(ctx context.Context, inventoryOrder *domain.InventoryOrder, actingClerkID string) (*domain.InventoryOrder, string, error) {
	// [ADDED 2026-10-13] a purchase request's status, quantity and amount follow its own steps
	var old struct {
		PrType        string
		Status        string
		OrderQuantity int
		Amount        float64
	}
	if err := s.db.WithContext(ctx).Raw(`SELECT COALESCE(pr_type,'') AS pr_type, status, order_quantity, amount FROM inventory_orders WHERE id = ?`,
		inventoryOrder.ID).Scan(&old).Error; err != nil {
		return nil, "", err
	}
	if err := stockcontrol.ValidateOrderEdit(old.PrType, old.Status, inventoryOrder.Status, old.OrderQuantity, inventoryOrder.OrderQuantity,
		old.Amount, inventoryOrder.Amount); err != nil {
		return nil, "", err
	}
	updateInventoryOrder, err := s.itemOrderRepo.UpdateInventoryOrder(ctx, inventoryOrder)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return updateInventoryOrder, actorName, nil
}
