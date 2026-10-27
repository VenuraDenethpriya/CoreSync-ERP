package sale

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetSalesList(ctx context.Context, query string, limit int, offset int) ([]*domain.Sale, error) {
	return s.repo.GetSalesList(ctx, query, limit, offset)
}
