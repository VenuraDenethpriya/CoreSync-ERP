package repair

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetRepairByID(ctx context.Context, repair *domain.Repair) (*domain.Repair, error) {
	return s.repairRepo.GetRepairByID(ctx, repair)
}
