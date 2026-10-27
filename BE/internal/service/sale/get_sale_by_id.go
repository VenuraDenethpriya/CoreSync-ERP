package sale

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetSaleByID(ctx context.Context, sale *domain.Sale) (*domain.Sale, error) {
	return s.repo.GetSaleByID(ctx, sale)
}
