package customer

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) SearchCustomers(ctx context.Context, query string, limit int, offset int) ([]*domain.Customer, int, error) {
	return s.repo.SearchCustomers(ctx, query, limit, offset)
}
