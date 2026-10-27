package product

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateProductBom(ctx context.Context, boms []*domain.Bom) ([]*domain.Bom, error) {
	return s.repo.CreateProductBom(ctx, boms)
}
