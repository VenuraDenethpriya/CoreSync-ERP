package sale

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetSalespersons(ctx context.Context, query string, limit int, offset int) ([]*domain.Salesperson, []int, []float64, int64, error) {
	return s.salespersonRepo.GetSalesperons(ctx, query, limit, offset)
}
