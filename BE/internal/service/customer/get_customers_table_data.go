package customer

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetCustomersTableData(ctx context.Context) ([]*domain.Customer, error) {
	return s.repo.GetCustomersTableData(ctx)
}
