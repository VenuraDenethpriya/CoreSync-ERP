package inventory

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) DeleteInventoryItemUsage(ctx context.Context, inventoryItemUsage *domain.InventoryItemUsage, actingClerkID string) (*domain.InventoryItemUsage, string, error) {
	deletedRestock, err := s.usageRepo.DeleteInventoryItemUsage(ctx, inventoryItemUsage)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deletedRestock, actorName, nil
}
