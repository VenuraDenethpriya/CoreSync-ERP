package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) CreateOrderItem(ctx context.Context, orderItem *domain.OrderItem) (*domain.OrderItem, error) {
	return s.orderItemRepo.CreateOrderItem(ctx, orderItem)
}
