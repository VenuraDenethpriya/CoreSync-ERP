package customer

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) CreateCustomer(ctx context.Context, customer *domain.Customer) (*domain.Customer, error) {
	return s.repo.CreateCustomer(ctx, customer)
}
