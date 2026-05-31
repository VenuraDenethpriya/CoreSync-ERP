package inventory

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) DeleteInventoryItemAllocation(ctx context.Context, allocation *domain.InventoryItemAllocate, actingClerkID string) (*domain.InventoryItemAllocate, string, error) {
	deletedAllocation, err := s.allocateRepo.DeleteInventoryItemAllocation(ctx, allocation)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deletedAllocation, actorName, nil
}
