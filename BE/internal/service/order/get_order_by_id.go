package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetOrderById(ctx context.Context, order *domain.Order) (*domain.Order, error) {
	return s.orderRepo.GetOrderById(ctx, order)
}
