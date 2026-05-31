package sale

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetSales(ctx context.Context, query string, status string, limit int, offset int) ([]*domain.Sale, int64, error) {
	return s.repo.GetSales(ctx, query, status, limit, offset)
}
