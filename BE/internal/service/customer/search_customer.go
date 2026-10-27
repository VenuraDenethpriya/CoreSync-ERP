package customer

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) SearchCustomers(ctx context.Context, query string, limit int, offset int, sortByTotal bool) ([]*domain.Customer, int, error) {
	return s.repo.SearchCustomers(ctx, query, limit, offset, sortByTotal)
}
