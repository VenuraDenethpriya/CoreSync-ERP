package product

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetProductByID(ctx context.Context, product *domain.Product) (*domain.Product, error) {
	return s.repo.GetProductByID(ctx, product)
}
