package sale

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) DeleteSale(ctx context.Context, sale *domain.Sale, actingClerkID string) (*domain.Sale, string, error) {
	deleteSale, err := s.repo.DeleteSale(ctx, sale)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deleteSale, actorName, nil
}
