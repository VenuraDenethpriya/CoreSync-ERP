package inventory

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateInventoryItemUsage(ctx context.Context, inventoryItemUsage *domain.InventoryItemUsage, actingClerkID string) (*domain.InventoryItemUsage, string, error) {
	updateUsage, err := s.usageRepo.UpdateInventoryItemUsage(ctx, inventoryItemUsage)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return updateUsage, actorName, nil
}
