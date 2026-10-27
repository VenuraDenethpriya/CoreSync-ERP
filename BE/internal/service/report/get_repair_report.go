package report

import (
	"CoreSync-backend/internal/service/domain"
	"time"
)

func (s *service) GetRepairsReport(startDate, endDate time.Time) ([]*domain.Repair, error) {
	return s.reportRepo.GetRepairsReport(startDate, endDate)
}
