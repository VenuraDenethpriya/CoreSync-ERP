package repository

import (
	"CoreSync-backend/internal/models"
	"CoreSync-backend/internal/service/domain"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type ReportRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) *ReportRepository {
	return &ReportRepository{
		db: db,
	}
}

func (r *ReportRepository) GetInventoryReport(startDate, endDate time.Time) ([]*domain.Inventory, error) {
	var inventoryModels []models.InventoryModel

	err := r.db.Preload("User").
		Where("created_at >= ? AND created_at <= ?", startDate, endDate).
		Find(&inventoryModels).Error

	if err != nil {
		return nil, err
	}

	var inventories []*domain.Inventory
	for _, model := range inventoryModels {
		inventories = append(inventories, model.InventoryModelToDomain())
	}

	return inventories, nil
}

func (r *ReportRepository) GetProductsReport(startDate, endDate time.Time) ([]*domain.Product, error) {
	var productModels []models.ProductModel

	err := r.db.Preload("User").
		Where("created_at >= ? AND created_at <= ?", startDate, endDate).
		Find(&productModels).Error
	if err != nil {
		return nil, err
	}

	var products []*domain.Product
	for _, model := range productModels {
		products = append(products, model.ProductModelToDomain())
	}

	return products, nil
}

func (r *ReportRepository) GetQuotesReport(startDate, endDate time.Time) ([]*domain.Quote, error) {
	var quoteModels []models.QuoteModel
	err := r.db.
		Preload("User").
		Preload("Customer").
		Where("created_at >= ? AND created_at <= ?", startDate, endDate).
		Find(&quoteModels).Error
	if err != nil {
		return nil, err
	}
	var quotes []*domain.Quote
	for _, model := range quoteModels {
		quotes = append(quotes, model.QuoteModelToDomain())
	}
	return quotes, nil
}

func (r *ReportRepository) GetOrdersReport(StartDate time.Time, EndDate time.Time, vat string, OrderStatus string, PaymentStatus string, Salesperson string, PaymentMode string) ([]*domain.Order, error) {
	var orderModels []models.OrderModel

	query := r.db.Model(&models.OrderModel{}).
		Preload("User").
		Preload("Customer").
		Preload("OrderPayments").
		Preload("Sale").
		Preload("Sale.SalespersonData").
		Preload("Sale.User").
		Joins("LEFT JOIN order_payments ON order_payments.order_id = orders.order_id").
		Joins("LEFT JOIN sales ON sales.sales_id = orders.sales_id").
		Where("orders.created_at >= ? AND orders.created_at <= ?", StartDate, EndDate)

	if vat != "" {
		query = query.Where("orders.vat = ?", vat)
	}
	if OrderStatus != "" {
		query = query.Where("orders.order_status = ?", OrderStatus)
	}
	if PaymentStatus != "" {
		query = query.Where("orders.payment_status = ?", PaymentStatus)
	}
	if Salesperson != "" {
		query = query.Where("sales.salesperson = ?", Salesperson)
	}
	if PaymentMode != "" {
		query = query.Where("order_payments.payment_mode = ?", PaymentMode)
	}

	err := query.Select("DISTINCT orders.*").Find(&orderModels).Error
	if err != nil {
		return nil, err
	}

	for _, m := range orderModels {
		fmt.Printf("Order %s has %d payments loaded\n", m.OrderNo, len(m.OrderPayments))
	}

	var orders []*domain.Order
	for _, model := range orderModels {
		orders = append(orders, model.OrderModelToDomain())
	}

	return orders, nil
}

func (r *ReportRepository) GetSalesReport(StartDate time.Time, EndDate time.Time, vat string, OrderStatus string, PaymentStatus string, Salesperson string, PaymentMode string) ([]*domain.Sale, error) {
	var saleModels []models.SaleModel

	query := r.db.Model(&models.SaleModel{}).
		Preload("Order").
		Preload("Order.OrderPayments").
		Preload("SalespersonData").
		Preload("User").
		Joins("LEFT JOIN orders ON orders.sales_id = sales.sales_id").
		Where("sales.created_at >= ? AND sales.created_at <= ?", StartDate, EndDate)

	if Salesperson != "" {
		query = query.Where("sales.salesperson = ?", Salesperson)
	}
	if vat != "" {
		query = query.Where("orders.vat = ?", vat)
	}
	if OrderStatus != "" {
		query = query.Where("orders.order_status = ?", OrderStatus)
	}
	if PaymentStatus != "" {
		query = query.Where("orders.payment_status = ?", PaymentStatus)
	}
	if PaymentMode != "" {
		query = query.Where("EXISTS (SELECT 1 FROM order_payments WHERE order_payments.order_id = orders.order_id AND order_payments.payment_mode = ?)", PaymentMode)
	}

	err := query.Find(&saleModels).Error
	if err != nil {
		return nil, err
	}

	var sales []*domain.Sale
	for _, model := range saleModels {
		sales = append(sales, model.SaleFromModelToDomain())
	}

	return sales, nil
}

func (r *ReportRepository) GetRepairsReport(startDate, endDate time.Time) ([]*domain.Repair, error) {
	var repairModels []models.RepairModel
	err := r.db.
		Preload("User").
		Where("created_at >= ? AND created_at <= ?", startDate, endDate).
		Find(&repairModels).Error
	if err != nil {
		return nil, err
	}
	var repairs []*domain.Repair
	for _, model := range repairModels {
		repairs = append(repairs, model.RepairFromModelToDomain())
	}
	return repairs, nil
}

func (r *ReportRepository) GetPaymentsReport(StartDate time.Time, EndDate time.Time, vat string, OrderStatus string, PaymentStatus string, Salesperson string, PaymentMode string) ([]*domain.Payment, error) {
	var paymentModels []models.PaymentModel

	query := r.db.Model(&models.PaymentModel{}).
		Preload("Order").
		Preload("Order.Customer").
		Preload("Order.Sale").
		Preload("Order.Sale.SalespersonData").
		Preload("User").
		Joins("JOIN orders ON orders.order_id = order_payments.order_id").
		Joins("LEFT JOIN sales ON sales.sales_id = orders.sales_id").
		Where("orders.created_at >= ? AND orders.created_at <= ?", StartDate, EndDate)

	if PaymentMode != "" {
		query = query.Where("order_payments.payment_mode = ?", PaymentMode)
	}
	if vat != "" {
		query = query.Where("orders.vat = ?", vat)
	}
	if OrderStatus != "" {
		query = query.Where("orders.order_status = ?", OrderStatus)
	}
	if PaymentStatus != "" {
		query = query.Where("orders.payment_status = ?", PaymentStatus)
	}
	if Salesperson != "" {
		query = query.Where("sales.salesperson = ?", Salesperson)
	}

	err := query.Find(&paymentModels).Error
	if err != nil {
		return nil, err
	}

	var payments []*domain.Payment
	for _, model := range paymentModels {
		payments = append(payments, model.PaymentModelToDomain())
	}

	return payments, nil
}
