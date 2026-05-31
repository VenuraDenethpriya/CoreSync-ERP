package report

import (
	"rims-backend/internal/service/domain"
	"time"
)

func (s *service) GetProductsReport(startDate, endDate time.Time) ([]*domain.Product, error) {
	return s.reportRepo.GetProductsReport(startDate, endDate)
}
