package report

import (
	"CoreSync-backend/internal/service/domain"
	"CoreSync-backend/internal/storage/repository"
	"time"

	"gorm.io/gorm"
)

type Service interface {
	GetInventoryReport(StartDate time.Time, EndDate time.Time) ([]*domain.Inventory, error)
	GetProductsReport(StartDate time.Time, EndDate time.Time) ([]*domain.Product, error)
	GetQuotesReport(StartDate time.Time, EndDate time.Time) ([]*domain.Quote, error)
	GetOrdersReport(StartDate time.Time, EndDate time.Time, vat string, OrderStatus string, PaymentStatus string, Salesperson string, PaymentMode string) ([]*domain.Order, error)
	GetPaymentsReport(StartDate time.Time, EndDate time.Time, vat string, OrderStatus string, PaymentStatus string, Salesperson string, PaymentMode string) ([]*domain.Payment, error)
	GetSalesReport(StartDate time.Time, EndDate time.Time, vat string, OrderStatus string, PaymentStatus string, Salesperson string, PaymentMode string) ([]*domain.Sale, error)
	GetRepairsReport(StartDate time.Time, EndDate time.Time) ([]*domain.Repair, error)
}
type service struct {
	db         *gorm.DB
	reportRepo repository.ReportRepository
}

func NewService(db *gorm.DB, reportRepo repository.ReportRepository) Service {
	return &service{
		db:         db,
		reportRepo: reportRepo,
	}
}
