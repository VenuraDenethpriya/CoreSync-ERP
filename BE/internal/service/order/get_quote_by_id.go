package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetQuoteByID(ctx context.Context, quote *domain.Quote) (*domain.Quote, error) {
	return s.quoteRepo.GetQuoteByID(ctx, quote)
}
