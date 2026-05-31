package customer

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetCustomerByID(ctx context.Context, customer *domain.Customer) (*domain.Customer, error) {
	return s.repo.GetCustomerByID(ctx, customer)
}
