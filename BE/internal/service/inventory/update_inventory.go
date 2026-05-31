package inventory

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateInventory(ctx context.Context, inventory *domain.Inventory, actingClerkID string) (*domain.Inventory, string, error) {
	updateInventory, err := s.repo.UpdateInventory(ctx, inventory)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return updateInventory, actorName, nil
}
