package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetAllOrders(ctx context.Context, searchQuery string, limit int, offset int, vat string, orderStatus string, paymentStatus string) ([]*domain.Order, int, error) {
	return s.orderRepo.GetAllOrders(ctx, searchQuery, limit, offset, vat, orderStatus, paymentStatus)
}
