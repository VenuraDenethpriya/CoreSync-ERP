package product

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) DeleteProduct(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	return s.repo.DeleteProduct(ctx, product)
}
