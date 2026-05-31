package inventory

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetNonResellableInventory(ctx context.Context, query string, limit int) ([]*domain.Inventory, error) {
	return s.repo.GetNonReservableInventory(ctx, query, limit)
}
