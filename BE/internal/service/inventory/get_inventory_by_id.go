package inventory

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetInventoryById(ctx context.Context, inventory *domain.Inventory) (*domain.Inventory, error) {
	return s.repo.GetInventoryById(ctx, inventory)
}
