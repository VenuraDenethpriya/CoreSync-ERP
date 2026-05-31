package repair

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetRepairByID(ctx context.Context, repair *domain.Repair) (*domain.Repair, error) {
	return s.repairRepo.GetRepairByID(ctx, repair)
}
