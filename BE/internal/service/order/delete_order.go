package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"

	"github.com/google/uuid"
)

func (s *service) DeleteOrder(ctx context.Context, orderID uuid.UUID, actingClerkID string) (*domain.Order, string, error) {
	deleteOrder, err := s.orderRepo.DeleteOrder(ctx, orderID)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deleteOrder, actorName, nil
}
