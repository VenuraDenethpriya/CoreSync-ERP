package sale

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) DeleteSalesperson(ctx context.Context, salesperson *domain.Salesperson, actingClerkID string) (*domain.Salesperson, string, error) {
	deleteSalesperson, err := s.salespersonRepo.DeleteSalesperson(ctx, salesperson)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deleteSalesperson, actorName, nil
}
