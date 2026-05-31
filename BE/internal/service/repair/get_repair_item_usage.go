package repair

import (
	"context"
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"
)

func (s *service) GetRepairItemUsages(
	ctx context.Context,
	jobID uuid.UUID,
	itemID uuid.UUID,
	limit int,
	offset int,
) ([]*domain.RepairItemUsage, int, string, error) {

	if itemID != uuid.Nil {
		rows, total, err := s.repairRepo.GetRepairUsageGroupedByJob(ctx, itemID, limit, offset)
		return rows, total, "job", err
	}

	if jobID != uuid.Nil {
		rows, total, err := s.repairRepo.GetRepairUsageGroupedByInventory(ctx, jobID, limit, offset)
		return rows, total, "inventory", err
	}

	return nil, 0, "", nil
}
