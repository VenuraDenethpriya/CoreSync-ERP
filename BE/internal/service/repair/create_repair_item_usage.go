package repair

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateRepairItemUsage(ctx context.Context, usageReq domain.RepairItemUsage) (*domain.RepairItemUsage, error) {
	return s.repairRepo.CreateRepairUsageAndAdjustInventory(s.db, usageReq)
}
