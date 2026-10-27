package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetAllQuotesDetails(ctx context.Context, query string, limit int, offset int) ([]*domain.Quote, error) {
	return s.quoteRepo.GetAllQuotesDetails(ctx, query, limit, offset)
}
