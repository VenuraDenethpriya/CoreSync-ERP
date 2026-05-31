package inventory

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) DeleteInventory(ctx context.Context, inventory *domain.Inventory, actingClerkID string) (*domain.Inventory, string, error) {
	deletedInventory, err := s.repo.DeleteInventory(ctx, inventory)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deletedInventory, actorName, nil
}
