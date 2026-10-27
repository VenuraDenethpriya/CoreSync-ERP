package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) UpdateQuoteItem(ctx context.Context, quoteItem *domain.QuoteItem) (*domain.QuoteItem, error) {
	return s.quoteItemRepo.UpdateQuoteItem(ctx, quoteItem)
}
