package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateQuoteItem(ctx context.Context, quoteItem *domain.QuoteItem) (*domain.QuoteItem, error) {
	return s.quoteItemRepo.UpdateQuoteItem(ctx, quoteItem)
}
