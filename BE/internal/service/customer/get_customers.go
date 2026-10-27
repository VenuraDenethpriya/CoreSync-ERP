package customer

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetCustomers(ctx context.Context) ([]*domain.Customer, error) {
	return s.repo.GetCustomers(ctx)
}
