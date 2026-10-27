package sale

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) DeleteSalesTarget(ctx context.Context, salesTarget *domain.SalesTarget, actingClerkID string) (*domain.SalesTarget, string, error) {
	deleteSalesTarget, err := s.repo.DeleteSalesTarget(ctx, salesTarget)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deleteSalesTarget, actorName, nil
}
