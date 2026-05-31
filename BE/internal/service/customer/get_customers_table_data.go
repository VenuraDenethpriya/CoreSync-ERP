package customer

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetCustomersTableData(ctx context.Context) ([]*domain.Customer, error) {
	return s.repo.GetCustomersTableData(ctx)
}
