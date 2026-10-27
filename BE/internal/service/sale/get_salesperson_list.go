package sale

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetSalespersonsList(ctx context.Context, status string) ([]*domain.Salesperson, error) {
	return s.salespersonRepo.GetSalesperonsList(ctx, status)
}
