package inventory

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateInventoryItemRestockPrintStatus(ctx context.Context, inventoryItemRestock *domain.InventoryItemRestock, actingClerkID string) (*domain.InventoryItemRestock, string, error) {
	updatedRestock, err := s.restockRepo.UpdateInventoryItemRestockPrintStatus(ctx, inventoryItemRestock)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return updatedRestock, actorName, nil
}
