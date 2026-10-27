package report

import (
	"CoreSync-backend/internal/service/domain"
	"time"
)

func (s *service) GetPaymentsReport(StartDate time.Time, EndDate time.Time, vat string, OrderStatus string, PaymentStatus string, Salesperson string, PaymentMode string) ([]*domain.Payment, error) {
	return s.reportRepo.GetPaymentsReport(StartDate, EndDate, vat, OrderStatus, PaymentStatus, Salesperson, PaymentMode)
}
