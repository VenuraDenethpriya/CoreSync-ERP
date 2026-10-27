package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetInventoryReceivedOrders(ctx context.Context, query string, limit int, offset int) ([]*domain.InventoryOrder, int, error) {
	return s.itemOrderRepo.GetInventoryReceivedOrders(ctx, query, limit, offset)
}
