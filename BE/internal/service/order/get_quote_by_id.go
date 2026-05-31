package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetQuoteByID(ctx context.Context, quote *domain.Quote) (*domain.Quote, error) {
	return s.quoteRepo.GetQuoteByID(ctx, quote)
}
