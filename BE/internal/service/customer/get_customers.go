package customer

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetCustomers(ctx context.Context) ([]*domain.Customer, error) {
	return s.repo.GetCustomers(ctx)
}
