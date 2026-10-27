package customer

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetCustomerByPhoneNo(ctx context.Context, phoneNo string) (*domain.Customer, error) {
	return s.repo.GetCustomerByPhoneNo(ctx, phoneNo)
}
