package sale

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetSaleByID(ctx context.Context, sale *domain.Sale) (*domain.Sale, error) {
	return s.repo.GetSaleByID(ctx, sale)
}
