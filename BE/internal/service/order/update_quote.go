package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateQuote(ctx context.Context, quote *domain.Quote) (*domain.Quote, error) {
	return s.quoteRepo.UpdateQuote(ctx, quote)
}
