package sale

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetSalespersonsList(ctx context.Context) ([]*domain.Salesperson, error) {
	return s.salespersonRepo.GetSalesperonsList(ctx)
}
