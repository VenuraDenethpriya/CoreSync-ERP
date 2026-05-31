package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetCardOrders(ctx context.Context, query string, limit int, offset int) ([]*domain.Order, error) {
	return s.orderRepo.GetCardOrders(ctx, query, limit, offset)
}
