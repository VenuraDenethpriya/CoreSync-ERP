package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetOrderById(ctx context.Context, order *domain.Order) (*domain.Order, error) {
	return s.orderRepo.GetOrderById(ctx, order)
}
