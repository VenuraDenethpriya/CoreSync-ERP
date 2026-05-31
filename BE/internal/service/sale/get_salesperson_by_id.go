package sale

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetSalespersonByID(ctx context.Context, salesperson *domain.Salesperson) (*domain.Salesperson, int, float64, int, float64, error) {
	return s.salespersonRepo.GetSalespersonByID(ctx, salesperson)
}
