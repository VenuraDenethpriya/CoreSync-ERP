package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) CreateQuote(ctx context.Context, quote *domain.Quote) (*domain.Quote, error) {
	return s.quoteRepo.CreateQuote(ctx, quote)
}
