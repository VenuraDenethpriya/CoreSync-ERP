package report

import (
	"rims-backend/internal/service/domain"
	"time"
)

func (s *service) GetSalesReport(startDate, endDate time.Time) ([]*domain.Sale, error) {
	return s.reportRepo.GetSalesReport(startDate, endDate)
}
