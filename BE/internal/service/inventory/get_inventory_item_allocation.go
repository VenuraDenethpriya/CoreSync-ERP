package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"context"

	"github.com/google/uuid"
)

func (s *service) GetInventoryItemAllocation(ctx context.Context, orderID uuid.UUID, itemID uuid.UUID, packID uuid.UUID, limit int, offset int) ([]*domain.InventoryItemAllocate, int, error) {
	return s.allocateRepo.GetInventoryItemAllocation(ctx, orderID, itemID, packID, limit, offset)
}
