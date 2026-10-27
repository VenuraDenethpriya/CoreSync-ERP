package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetInventory(ctx context.Context, query string, limit int, offset int, sellable *bool) ([]*domain.Inventory, int, error) {
	return s.repo.GetInventory(ctx, query, limit, offset, sellable)
}
