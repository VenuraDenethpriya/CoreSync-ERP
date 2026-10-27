package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateQuote(ctx context.Context, quote *domain.Quote) (*domain.Quote, error) {
	return s.quoteRepo.CreateQuote(ctx, quote)
}
