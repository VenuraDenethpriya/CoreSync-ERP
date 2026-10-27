package customer

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetCustomerByID(ctx context.Context, customer *domain.Customer) (*domain.Customer, error) {
	return s.repo.GetCustomerByID(ctx, customer)
}
