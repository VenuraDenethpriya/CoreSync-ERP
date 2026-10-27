package sale

import (
	"CoreSync-backend/internal/service/domain"
	"context"
	"time"

	"github.com/google/uuid"
)

func (s *service) GetSalesTargetsForSalespersons(ctx context.Context, salespersonID uuid.UUID, startDate, endDate time.Time) ([]domain.SalesTarget, error) {
	return s.repo.GetSalesTargetsForSalespersons(ctx, salespersonID, startDate, endDate)
}
