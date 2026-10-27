package sale

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetSalesDashboardData(ctx context.Context) (*domain.SalesDashboard, error) {
	return s.repo.GetSalesDashboardData(ctx)
}
