package sale

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetCalls(ctx context.Context, query string, limit int, offset int, userRole string, clerkID string, userEmail string) ([]*domain.Call, int, error) {
	return s.callRepo.GetCalls(ctx, query, limit, offset, userRole, clerkID, userEmail)
}
