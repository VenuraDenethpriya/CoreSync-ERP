package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetAllOrders(ctx context.Context, searchQuery string, limit int, offset int, vat string, orderStatus string, paymentStatus string, userRole string, clerkID string, userEmail string) ([]*domain.Order, int, error) {
	return s.orderRepo.GetAllOrders(ctx, searchQuery, limit, offset, vat, orderStatus, paymentStatus, userRole, clerkID, userEmail)
}
