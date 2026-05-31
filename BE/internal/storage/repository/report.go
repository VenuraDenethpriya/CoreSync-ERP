package repository

import (
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"
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

func (r *ReportRepository) GetOrdersReport(startDate, endDate time.Time) ([]*domain.Order, error) {
	var orderModels []models.OrderModel
	err := r.db.
		Preload("User").
		Preload("Customer").
		Where("created_at >= ? AND created_at <= ?", startDate, endDate).
		Find(&orderModels).Error
	if err != nil {
		return nil, err
	}
	var orders []*domain.Order
	for _, model := range orderModels {
		orders = append(orders, model.OrderModelToDomain())
	}
	return orders, nil
}

func (r *ReportRepository) GetSalesReport(startDate, endDate time.Time) ([]*domain.Sale, error) {
	var saleModels []models.SaleModel
	err := r.db.
		Preload("User").
		Preload("SalespersonData").
		Where("created_at >= ? AND created_at <= ?", startDate, endDate).
		Find(&saleModels).Error
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
