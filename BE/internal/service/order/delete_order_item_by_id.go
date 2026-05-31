package order

import (
	"context"

	"github.com/google/uuid"
)

func (s *service) DeleteOrderItemByID(ctx context.Context, itemID uuid.UUID) error {
	return s.orderItemRepo.DeleteOrderItemByID(ctx, itemID)
}
