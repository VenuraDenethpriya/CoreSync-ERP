package sale

import (
	"context"
	"fmt"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateSalesperson(ctx context.Context, salesperson *domain.Salesperson, actingClerkID string) (*domain.Salesperson, string, error) {
	updatedSalesperson, err := s.salespersonRepo.UpdateSalesperson(ctx, salesperson)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := fmt.Sprintf("%s %s", actor.FirstName, actor.LastName)
	return updatedSalesperson, actorName, nil
}
