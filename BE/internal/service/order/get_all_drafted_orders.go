package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetAllDraftedOrders(ctx context.Context, query string, limit int, offset int) ([]*domain.Order, int, error) {
	return s.orderRepo.GetAllDraftedOrders(ctx, query, limit, offset)
}
