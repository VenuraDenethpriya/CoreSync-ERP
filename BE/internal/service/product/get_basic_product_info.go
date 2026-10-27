package product

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetBasicProductInfo(ctx context.Context) ([]*domain.Product, error) {
	return s.repo.GetBasicProductInfo(ctx)
}
