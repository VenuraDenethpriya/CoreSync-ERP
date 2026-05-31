package product

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	return s.repo.UpdateProduct(ctx, product)
}
