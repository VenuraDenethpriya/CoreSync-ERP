package product

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) UpdateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	return s.repo.UpdateProduct(ctx, product)
}
