package product

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetProductByID(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	return s.repo.GetProductByID(ctx, product)
}
