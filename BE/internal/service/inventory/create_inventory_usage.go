package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateInventoryItemUsage(ctx context.Context, usageReq domain.InventoryItemUsage) (*domain.InventoryItemUsage, error) {
	return s.usageRepo.CreateUsageAndAdjustInventory(s.db, usageReq)
}
