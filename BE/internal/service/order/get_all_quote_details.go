package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetAllQuotesDetails(ctx context.Context, query string, limit int, offset int) ([]*domain.Quote, error) {
	return s.quoteRepo.GetAllQuotesDetails(ctx, query, limit, offset)
}
