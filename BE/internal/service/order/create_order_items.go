package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateOrderItem(ctx context.Context, orderItem *domain.OrderItem) (*domain.OrderItem, error) {
	return s.orderItemRepo.CreateOrderItem(ctx, orderItem)
}
