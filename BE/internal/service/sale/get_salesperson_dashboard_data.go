package sale

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetSingleSalespersonDashboard(ctx context.Context, email string) (*domain.SingleSalespersonDashboard, error) {
	return s.repo.GetSingleSalespersonDashboard(ctx, email)
}
