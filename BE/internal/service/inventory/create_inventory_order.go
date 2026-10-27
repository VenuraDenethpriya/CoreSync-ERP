package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateInventoryOrder(ctx context.Context, inventoryOrder *domain.InventoryOrder) (*domain.InventoryOrder, error) {
	return s.itemOrderRepo.CreateInventoryOrder(ctx, inventoryOrder)
}
