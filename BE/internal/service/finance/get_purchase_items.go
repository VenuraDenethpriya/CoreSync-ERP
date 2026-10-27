package finance

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetPurchaseItems(ctx context.Context, query string, limit int, offset int) ([]*domain.Finance, int, error) {
	getItems, total, err := s.financeRepo.GetPurchaseItems(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	return getItems, total, nil
}
