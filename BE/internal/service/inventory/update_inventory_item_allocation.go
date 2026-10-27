package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) UpdateInventoryItemAllocation(ctx context.Context, inventoryItemAllocate *domain.InventoryItemAllocate, actingClerkID string) (*domain.InventoryItemAllocate, string, error) {
	updateAllocation, err := s.allocateRepo.UpdateInventoryItemAllocation(ctx, inventoryItemAllocate)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return updateAllocation, actorName, nil
}
