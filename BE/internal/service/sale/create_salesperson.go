package sale

import (
	"context"
	"fmt"
	"rims-backend/internal/service/domain"
)

func (s *service) CreateSalesperson(ctx context.Context, salesperson *domain.Salesperson, actingClerkID string) (*domain.Salesperson, string, error) {
	createdSalesperson, err := s.salespersonRepo.CreateSalesperson(ctx, salesperson)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := fmt.Sprintf("%s %s", actor.FirstName, actor.LastName)
	return createdSalesperson, actorName, nil
}
