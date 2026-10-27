package product

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetProducts(ctx context.Context, query string, limit int, offset int) ([]*domain.Product, int, error) {
	return s.repo.GetProducts(ctx, query, limit, offset)
}
