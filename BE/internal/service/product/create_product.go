package product

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	return s.repo.CreateProduct(ctx, product)
}
