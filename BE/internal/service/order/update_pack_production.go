package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
	"fmt"
)

func (s *service) UpdatePackProduction(ctx context.Context, pack *domain.OrderItem, actingClerkID string) (*domain.OrderItem, string, error) {
	updatedPack, err := s.orderItemRepo.UpdatePackProduction(ctx, pack)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := fmt.Sprintf("%s %s", actor.FirstName, actor.LastName)
	return updatedPack, actorName, nil
}
