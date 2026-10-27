package product

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetProductBomByID(ctx context.Context, product *domain.Product) ([]*domain.Bom, error) {
	return s.repo.GetProductBomByID(ctx, product)
}
