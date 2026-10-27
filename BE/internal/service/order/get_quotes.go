package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetQuotes(ctx context.Context, query string, limit int, offset int, userRole string, clerkID string, userEmail string) ([]*domain.Quote, int, error) {
	return s.quoteRepo.GetQuotes(ctx, query, limit, offset, userRole, clerkID, userEmail)
}
