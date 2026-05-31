package inventory

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetInventory(ctx context.Context, query string, limit int, offset int) ([]*domain.Inventory, int, error) {
	return s.repo.GetInventory(ctx, query, limit, offset)
}
