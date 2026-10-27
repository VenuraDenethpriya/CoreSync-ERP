package sale

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetSalespersonByID(ctx context.Context, salesperson *domain.Salesperson) (*domain.Salesperson, int, float64, int, float64, error) {
	return s.salespersonRepo.GetSalespersonByID(ctx, salesperson)
}
