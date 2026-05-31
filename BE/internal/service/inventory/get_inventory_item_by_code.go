package inventory

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetInventoryItemByCode(ctx context.Context, inventory_item *domain.InventoryItem) (*domain.InventoryItem, error) {
	return s.itemRepo.GetInventoryItemByCode(ctx, inventory_item)
}
