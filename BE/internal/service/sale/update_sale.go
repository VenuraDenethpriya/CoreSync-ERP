package sale

import (
	"context"
	"fmt"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateSale(ctx context.Context, sale *domain.Sale, actingClerkID string) (*domain.Sale, string, error) {
	updatedSale, err := s.repo.UpdateSale(ctx, sale)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := fmt.Sprintf("%s %s", actor.FirstName, actor.LastName)
	return updatedSale, actorName, nil
}
