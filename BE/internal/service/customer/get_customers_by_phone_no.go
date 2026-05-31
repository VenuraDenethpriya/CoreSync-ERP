package customer

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetCustomerByPhoneNo(ctx context.Context, phoneNo string) (*domain.Customer, error) {
	return s.repo.GetCustomerByPhoneNo(ctx, phoneNo)
}
