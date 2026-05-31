package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateOrderItem(ctx context.Context, orderItem *domain.OrderItem) (*domain.OrderItem, error) {
	return s.orderItemRepo.UpdateOrderItem(ctx, orderItem)
}
