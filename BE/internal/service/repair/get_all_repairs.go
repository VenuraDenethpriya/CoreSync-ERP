package repair

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetRepairs(ctx context.Context, query string, limit int, offset int) ([]*domain.Repair, int, error) {
	return s.repairRepo.GetRepairs(ctx, query, limit, offset)
}
