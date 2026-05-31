package report

import (
	"rims-backend/internal/service/domain"
	"time"
)

func (s *service) GetInventoryReport(startDate, endDate time.Time) ([]*domain.Inventory, error) {
	return s.reportRepo.GetInventoryReport(startDate, endDate)
}
