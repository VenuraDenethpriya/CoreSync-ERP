package order

import (
	"context"

	"github.com/google/uuid"
)

func (s *service) DeleteQuoteItemByID(ctx context.Context, itemID uuid.UUID) error {
	return s.quoteItemRepo.DeleteQuoteItemByID(ctx, itemID)
}
