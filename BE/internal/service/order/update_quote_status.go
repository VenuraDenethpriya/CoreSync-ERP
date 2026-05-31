package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateQuoteStatus(ctx context.Context, quote *domain.Quote) (*domain.Quote, error) {
	return s.quoteRepo.UpdateQuoteStatus(ctx, quote)
}
