package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateInventoryItemAllocation(ctx context.Context, inventoryItemAllocation *domain.InventoryItemAllocate) (*domain.InventoryItemAllocate, error) {
	return s.allocateRepo.CreateInventoryItemAllocation(ctx, inventoryItemAllocation)
}
