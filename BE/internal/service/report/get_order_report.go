package report

import (
	"rims-backend/internal/service/domain"
	"time"
)

func (s *service) GetOrdersReport(startDate, endDate time.Time) ([]*domain.Order, error) {
	return s.reportRepo.GetOrdersReport(startDate, endDate)
}
