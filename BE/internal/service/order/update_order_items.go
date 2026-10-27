package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) UpdateOrderItem(ctx context.Context, orderItem *domain.OrderItem) (*domain.OrderItem, error) {
	return s.orderItemRepo.UpdateOrderItem(ctx, orderItem)
}
