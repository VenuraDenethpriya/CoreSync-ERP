package sale

import (
	"CoreSync-backend/internal/service/domain"
	"context"
	"fmt"
)

func (s *service) CreateSalesTarget(ctx context.Context, salesTarget *domain.SalesTarget, actingClerkID string) (*domain.SalesTarget, string, error) {
	createdSalesTarget, err := s.repo.CreateSalesTarget(ctx, salesTarget)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := fmt.Sprintf("%s %s", actor.FirstName, actor.LastName)
	return createdSalesTarget, actorName, nil
}
