package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetQuotes(ctx context.Context, query string, limit int, offset int) ([]*domain.Quote, int, error) {
	return s.quoteRepo.GetQuotes(ctx, query, limit, offset)
}
