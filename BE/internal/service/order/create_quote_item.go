package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) CreateQuoteItem(ctx context.Context, quoteItem *domain.QuoteItem) (*domain.QuoteItem, error) {
	return s.quoteItemRepo.CreateQuoteItem(ctx, quoteItem)
}
