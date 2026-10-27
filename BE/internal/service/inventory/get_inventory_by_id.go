package inventory

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetInventoryById(ctx context.Context, inventory *domain.Inventory) (*domain.Inventory, error) {
	return s.repo.GetInventoryById(ctx, inventory)
}
