package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateOrder(ctx context.Context, order *domain.Order) (*domain.Order, error) {
	updatedOrder, err := s.orderRepo.UpdateOrder(ctx, order)
	if err != nil {
		return nil, err
	}
	// s.bus.Publish(events.Event{Type: "order.updated", Data: updatedOrder})
	return updatedOrder, nil
}
