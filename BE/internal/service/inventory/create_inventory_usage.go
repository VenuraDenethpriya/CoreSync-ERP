package inventory

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) CreateInventoryItemUsage(ctx context.Context, usageReq domain.InventoryItemUsage) (*domain.InventoryItemUsage, error) {
	return s.usageRepo.CreateUsageAndAdjustInventory(s.db, usageReq)
}
