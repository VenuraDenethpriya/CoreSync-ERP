package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateQuoteItem(ctx context.Context, quoteItem *domain.QuoteItem) (*domain.QuoteItem, error) {
	return s.quoteItemRepo.CreateQuoteItem(ctx, quoteItem)
}
