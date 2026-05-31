package inventory

import (
	"context"
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"
)

func (s *service) GetInventoryItemUsages(
	ctx context.Context,
	orderID uuid.UUID,
	itemID uuid.UUID,
	limit int,
	offset int,
) ([]*domain.InventoryItemUsage, int, string, error) {

	if itemID != uuid.Nil {
		rows, total, err := s.usageRepo.GetUsageGroupedByOrder(ctx, itemID, limit, offset)
		return rows, total, "order", err
	}

	if orderID != uuid.Nil {
		rows, total, err := s.usageRepo.GetUsageGroupedByInventory(ctx, orderID, limit, offset)
		return rows, total, "inventory", err
	}

	return nil, 0, "", nil
}
