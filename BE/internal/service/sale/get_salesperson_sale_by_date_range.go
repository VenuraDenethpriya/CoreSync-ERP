package sale

import (
	"context"
	"time"

	"github.com/google/uuid"
)

func (s *service) GetSalesAndCommissionByDateRange(ctx context.Context, SalespersonID uuid.UUID, StartDate time.Time, EndDate time.Time) (int, float64, error) {
	return s.salespersonRepo.GetSalesAndCommissionByDateRange(SalespersonID, StartDate, EndDate)
}
