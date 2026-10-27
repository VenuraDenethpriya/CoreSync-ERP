package finance

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetPurchaseOrders(ctx context.Context, query string, limit int, offset int) ([]*domain.Finance, int, error) {
	getPurchaseOrders, total, err := s.financeRepo.GetPurchaseOrders(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	return getPurchaseOrders, total, nil
}
