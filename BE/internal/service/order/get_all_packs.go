package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetAllPacks(ctx context.Context, query string, limit int, offset int) ([]*domain.OrderItem, int64, error) {
	return s.orderItemRepo.GetAllPacks(ctx, query, limit, offset)
}
