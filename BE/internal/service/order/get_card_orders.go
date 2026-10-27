package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetCardOrders(ctx context.Context, query string, limit int, offset int) ([]*domain.Order, error) {
	return s.orderRepo.GetCardOrders(ctx, query, limit, offset)
}
