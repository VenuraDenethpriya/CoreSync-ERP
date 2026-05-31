package report

import (
	"rims-backend/internal/service/domain"
	"time"
)

func (s *service) GetQuotesReport(startDate, endDate time.Time) ([]*domain.Quote, error) {
	return s.reportRepo.GetQuotesReport(startDate, endDate)
}
