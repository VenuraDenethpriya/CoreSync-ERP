package inventory

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) CreateInventory(ctx context.Context, inventory *domain.Inventory) (*domain.Inventory, error) {
	return s.repo.CreateInventory(ctx, inventory)
}
