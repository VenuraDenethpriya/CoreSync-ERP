package order

import (
	"context"
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"
)

func (s *service) DeleteOrder(ctx context.Context, orderID uuid.UUID) (*domain.Order, error) {
	deleteOrder, err := s.orderRepo.DeleteOrder(ctx, orderID)
	if err != nil {
		return nil, err
	}
	// s.bus.Publish(events.Event{Type: "order.deleted", Data: deleteOrder})
	return deleteOrder, nil
}
