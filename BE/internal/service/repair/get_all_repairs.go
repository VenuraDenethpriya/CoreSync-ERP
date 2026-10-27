package repair

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetRepairs(ctx context.Context, query string, limit int, offset int) ([]*domain.Repair, int, error) {
	return s.repairRepo.GetRepairs(ctx, query, limit, offset)
}
