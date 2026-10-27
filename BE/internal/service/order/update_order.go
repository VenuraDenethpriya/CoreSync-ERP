package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) UpdateOrder(ctx context.Context, order *domain.Order) (*domain.Order, error) {
	updatedOrder, err := s.orderRepo.UpdateOrder(ctx, order)
	if err != nil {
		return nil, err
	}
	// [ADDED 2026-10-13] the edit screen can also change the status (no acting user here: creator recorded)
	s.stockOrderChanged(ctx, order.OrderID, order.CreatedBy)
	// s.bus.Publish(events.Event{Type: "order.updated", Data: updatedOrder})
	return updatedOrder, nil
}
