package customer

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateCustomer(ctx context.Context, customer *domain.Customer) (*domain.Customer, error) {
	return s.repo.CreateCustomer(ctx, customer)
}
