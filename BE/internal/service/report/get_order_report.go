package report

import (
	"CoreSync-backend/internal/service/domain"
	"time"
)

func (s *service) GetOrdersReport(StartDate time.Time, EndDate time.Time, vat string, OrderStatus string, PaymentStatus string, Salesperson string, PaymentMode string) ([]*domain.Order, error) {
	return s.reportRepo.GetOrdersReport(StartDate, EndDate, vat, OrderStatus, PaymentStatus, Salesperson, PaymentMode)
}
