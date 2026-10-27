package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetInventoryItemByCode(ctx context.Context, inventory_item *domain.InventoryItem) (*domain.InventoryItem, error) {
	return s.itemRepo.GetInventoryItemByCode(ctx, inventory_item)
}
