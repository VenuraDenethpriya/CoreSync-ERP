package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
	"fmt"
)

func (s *service) UpdatePack(ctx context.Context, pack *domain.OrderItem, actingClerkID string) (*domain.OrderItem, string, error) {
	updatedPack, err := s.orderItemRepo.UpdatePack(ctx, pack)
	if err != nil {
		return nil, "", err
	}
	s.stockPackChanged(ctx, pack.ID, actingClerkID) // [ADDED 2026-10-13] withdraw BOM on Completed / reverse
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := fmt.Sprintf("%s %s", actor.FirstName, actor.LastName)
	return updatedPack, actorName, nil
}
