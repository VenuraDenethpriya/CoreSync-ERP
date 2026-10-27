package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"

	"github.com/google/uuid"
)

func (s *service) GetOrderItemsByOrderID(ctx context.Context, orderID uuid.UUID) ([]*domain.OrderItem, error) {
	return s.orderItemRepo.GetOrderItemsByOrderID(ctx, orderID)
}
