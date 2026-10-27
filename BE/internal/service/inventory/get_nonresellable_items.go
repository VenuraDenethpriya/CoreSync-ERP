package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetNonResellableInventory(ctx context.Context, query string, limit int) ([]*domain.Inventory, error) {
	return s.repo.GetNonReservableInventory(ctx, query, limit)
}
