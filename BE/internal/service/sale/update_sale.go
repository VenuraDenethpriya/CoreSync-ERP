package sale

import (
	"CoreSync-backend/internal/service/domain"
	"context"
	"fmt"
)

func (s *service) UpdateSale(ctx context.Context, sale *domain.Sale, actingClerkID string) (*domain.Sale, string, error) {
	updatedSale, err := s.repo.UpdateSale(ctx, sale)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := fmt.Sprintf("%s %s", actor.FirstName, actor.LastName)
	return updatedSale, actorName, nil
}
