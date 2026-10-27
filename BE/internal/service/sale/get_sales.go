package sale

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetSales(ctx context.Context, query string, status string, limit int, offset int, userRole string, clerkID string, userEmail string) ([]*domain.Sale, int64, error) {
	return s.repo.GetSales(ctx, query, status, limit, offset, userRole, clerkID, userEmail)
}
