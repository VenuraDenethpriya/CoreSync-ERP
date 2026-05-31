package inventory

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) CreateInventoryItemAllocation(ctx context.Context, inventoryItemAllocation *domain.InventoryItemAllocate) (*domain.InventoryItemAllocate, error) {
	return s.allocateRepo.CreateInventoryItemAllocation(ctx, inventoryItemAllocation)
}
