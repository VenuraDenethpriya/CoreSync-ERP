package inventory

import (
	"context"
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"
)

func (s *service) GetInventoryItemAllocation(ctx context.Context, orderID uuid.UUID, itemID uuid.UUID, limit int, offset int) ([]*domain.InventoryItemAllocate, int, error) {
	return s.allocateRepo.GetInventoryItemAllocation(ctx, orderID, itemID, limit, offset)
}
