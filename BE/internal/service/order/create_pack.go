package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
	"fmt"
)

func (s *service) CreatePack(ctx context.Context, pack *domain.OrderItem, actingClerkID string) (*domain.OrderItem, string, error) {
	createdPack, err := s.orderItemRepo.CreateOrderItem(ctx, pack)
	if err != nil {
		return nil, "", err
	}
	s.stockPackCreated(ctx, createdPack.ID, createdPack.ProductID, createdPack.Quantity) // [ADDED 2026-10-13]
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := fmt.Sprintf("%s %s", actor.FirstName, actor.LastName)
	return createdPack, actorName, nil
}
