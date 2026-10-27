package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"context"

	"github.com/google/uuid"
)

func (s *service) GetInventoryItemRestock(ctx context.Context, itemID uuid.UUID, limit int, offset int) ([]*domain.InventoryItemRestock, int, error) {
	return s.restockRepo.GetInventoryItemRestock(ctx, itemID, limit, offset)
}
