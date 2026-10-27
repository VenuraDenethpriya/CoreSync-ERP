package report

import (
	"CoreSync-backend/internal/service/domain"
	"time"
)

func (s *service) GetSalesReport(StartDate time.Time, EndDate time.Time, vat string, OrderStatus string, PaymentStatus string, Salesperson string, PaymentMode string) ([]*domain.Sale, error) {
	return s.reportRepo.GetSalesReport(StartDate, EndDate, vat, OrderStatus, PaymentStatus, Salesperson, PaymentMode)
}
