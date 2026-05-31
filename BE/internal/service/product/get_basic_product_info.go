package product

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetBasicProductInfo(ctx context.Context) ([]*domain.Product, error) {
	return s.repo.GetBasicProductInfo(ctx)
}
