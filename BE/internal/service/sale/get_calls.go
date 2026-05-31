package sale

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetCalls(ctx context.Context, query string, limit int, offset int) ([]*domain.Call, int, error) {
	return s.callRepo.GetCalls(ctx, query, limit, offset)
}
