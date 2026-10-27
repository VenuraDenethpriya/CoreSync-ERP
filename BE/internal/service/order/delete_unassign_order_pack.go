package order

import (
	"context"

	"github.com/google/uuid"
)

func (s *service) DeleteUnassignedBatteryPacks(ctx context.Context, productID uuid.UUID, limit int) error {
	return s.orderItemRepo.DeleteUnassignedBatteryPacks(ctx, productID, limit)
}
