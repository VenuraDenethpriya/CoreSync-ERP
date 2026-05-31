package order

import (
	"context"
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"
)

func (s *service) GetQuoteItemsByQuoteID(ctx context.Context, quoteID uuid.UUID) ([]*domain.QuoteItem, error) {
	return s.quoteItemRepo.GetQuoteItemsByQuoteID(ctx, quoteID)
}
