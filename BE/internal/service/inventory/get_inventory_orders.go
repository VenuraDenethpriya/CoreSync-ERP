package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetInventoryOrders(ctx context.Context, query string, limit int, offset int) ([]*domain.InventoryOrder, int, error) {
	return s.itemOrderRepo.GetInventoryOrders(ctx, query, limit, offset)
}
