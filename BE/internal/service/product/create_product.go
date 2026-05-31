package product

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) CreateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	return s.repo.CreateProduct(ctx, product)
}
