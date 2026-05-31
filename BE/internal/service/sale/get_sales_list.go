package sale

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetSalesList(ctx context.Context, query string, limit int, offset int) ([]*domain.Sale, error) {
	return s.repo.GetSalesList(ctx, query, limit, offset)
}
