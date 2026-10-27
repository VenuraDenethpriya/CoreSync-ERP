package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"

	"github.com/google/uuid"
)

func (s *service) GetQuoteItemsByQuoteID(ctx context.Context, quoteID uuid.UUID) ([]*domain.QuoteItem, error) {
	return s.quoteItemRepo.GetQuoteItemsByQuoteID(ctx, quoteID)
}
