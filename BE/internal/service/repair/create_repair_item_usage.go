package repair

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) CreateRepairItemUsage(ctx context.Context, usageReq domain.RepairItemUsage) (*domain.RepairItemUsage, error) {
	return s.repairRepo.CreateRepairUsageAndAdjustInventory(s.db, usageReq)
}
