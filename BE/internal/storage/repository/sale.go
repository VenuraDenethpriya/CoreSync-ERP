package repository

import (
	"context"
	"fmt"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SaleRepository struct {
	db *gorm.DB
}

func NewSaleRepository(db *gorm.DB) *SaleRepository {
	return &SaleRepository{db: db}
}

//	func (sr *SaleRepository) CreateSale(ctx context.Context, sale *domain.Sale) (*domain.Sale, error) {
//		saleModel := models.SaleFromDomain(sale)
//		if err := sr.db.WithContext(ctx).Create(saleModel).Error; err != nil {
//			logger.Error(ctx, "Error creating sale", zap.String("method", "POST"), zap.String("path", "/sales"), zap.Any("sale", sale), zap.Error(err))
//			return nil, err
//		}
//		logger.Info(ctx, "Sale created", zap.String("method", "POST"), zap.String("path", "/sales"), zap.Any("sale", sale))
//		return saleModel.SaleFromModelToDomain(), nil
//	}

func (sr *SaleRepository) CreateSale(ctx context.Context, sale *domain.Sale) (*domain.Sale, error) {
	var createdSaleModel *models.SaleModel

	err := sr.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {

		// Generate SalesNo
		today := time.Now().Format("060102") // YYMMDD

		// Count how many sales created today (PostgreSQL)
		var count int64
		if err := tx.Model(&models.SaleModel{}).
			Where("DATE(created_at) = CURRENT_DATE").
			Count(&count).Error; err != nil {
			return err
		}

		sequence := count + 1
		salesNo := fmt.Sprintf("%s%d", today, sequence)

		// Map domain → model
		saleModel := models.SaleFromDomain(sale)
		saleModel.SalesNo = salesNo
		createdSaleModel = saleModel

		// Save record
		if err := tx.Create(saleModel).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		logger.Error(ctx, "Error creating sale", zap.String("method", "POST"), zap.String("path", "/sales"), zap.Any("sale", sale), zap.Error(err))
		return nil, err
	}

	logger.Info(ctx, "Sale created", zap.String("method", "POST"), zap.String("path", "/sales"), zap.Any("sale", createdSaleModel))

	return createdSaleModel.SaleFromModelToDomain(), nil
}

// func (sr *SaleRepository) GetSales(ctx context.Context, query string, status string, limit int, offset int) ([]*domain.Sale, int64, error) {
// 	var sales []models.SaleModel

// 	search := "%" + query + "%"

// 	tx := sr.db.
// 		Preload("SalespersonData").
// 		Preload("User").
// 		Where(`
// 			sales_no ILIKE ?
// 			OR sales_type ILIKE ?
// 			OR status ILIKE ?
// 			OR customer_name ILIKE ?
// 			OR customer_phone ILIKE ?
// 			OR salesperson_data.first_name ILIKE ?
// 			OR salesperson_data.last_name ILIKE ?
// 			OR creator.first_name ILIKE ?
// 			OR creator.last_name ILIKE ?
// 		`,
// 			search, search, search, search, search, search, search, search, search,
// 		).
// 		Joins("LEFT JOIN salespersons AS salesperson_data ON salesperson_data.id = sales.salesperson").
// 		Joins("LEFT JOIN users AS creator ON creator.clerk_id = sales.updated_by")

// 	if status != "" {
// 		tx = tx.Where("sales.status = ?", status)
// 	}

// 	// Count
// 	var total int64
// 	if err := tx.Model(&models.SaleModel{}).Count(&total).Error; err != nil {
// 		return nil, 0, err
// 	}

// 	// Pagination
// 	if err := tx.Limit(limit).
// 		Offset(offset).
// 		Order("sales.created_at DESC").
// 		Find(&sales).Error; err != nil {
// 		return nil, 0, err
// 	}

// 	// Convert to domain
// 	var domainSales []*domain.Sale
// 	for _, s := range sales {
// 		domainSale := s.SaleFromModelToDomain()

// 		// map salesperson
// 		domainSale.SalespersonData = s.SalespersonData.SalespersonFromModelToDomain()

// 		// map creator (from users table)
// 		if s.User.ID != uuid.Nil {
// 			domainSale.UpdatedBy = strings.TrimSpace(
// 				s.User.FirstName + " " + s.User.LastName,
// 			)
// 		}

// 		domainSales = append(domainSales, domainSale)
// 	}

//		return domainSales, total, nil
//	}
func (sr *SaleRepository) GetSales(ctx context.Context, query string, status string, limit int, offset int) ([]*domain.Sale, int64, error) {
	var sales []models.SaleModel

	tx := sr.db.
		Preload("SalespersonData").
		Preload("User").
		Joins("LEFT JOIN salespersons AS salesperson_data ON salesperson_data.id = sales.salesperson").
		Joins("LEFT JOIN users AS creator ON creator.clerk_id = sales.updated_by")

	if query != "" {
		search := "%" + query + "%"
		tx = tx.Where(`
            sales.sales_no ILIKE ?
            OR sales.sales_type ILIKE ?
            OR sales.status ILIKE ?
            OR sales.customer_name ILIKE ?
            OR sales.customer_phone ILIKE ?
            OR salesperson_data.first_name ILIKE ?
            OR salesperson_data.last_name ILIKE ?
            OR creator.first_name ILIKE ?
            OR creator.last_name ILIKE ?
        `,
			search, search, search, search, search, search, search, search, search,
		)
	}

	if status != "" && status != "All" {
		tx = tx.Where("sales.status ILIKE ?", status)
	}

	var total int64
	if err := tx.Model(&models.SaleModel{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := tx.Limit(limit).
		Offset(offset).
		Order("sales.created_at DESC").
		Find(&sales).Error; err != nil {
		return nil, 0, err
	}

	var domainSales []*domain.Sale
	for _, s := range sales {
		domainSale := s.SaleFromModelToDomain()

		domainSale.SalespersonData = s.SalespersonData.SalespersonFromModelToDomain()

		if s.User.ID != uuid.Nil {
			domainSale.UpdatedBy = strings.TrimSpace(
				s.User.FirstName + " " + s.User.LastName,
			)
		}

		domainSales = append(domainSales, domainSale)
	}

	return domainSales, total, nil
}

// func (sr *SaleRepository) UpdateSale(ctx context.Context, sale *domain.Sale) (*domain.Sale, error) {
// 	var existingSale models.SaleModel

// 	err := sr.db.
// 		Preload("SalespersonData").
// 		Preload("User").
// 		First(&existingSale, "sales_id = ?", sale.SalesID).Error

// 	if err != nil {
// 		if err == gorm.ErrRecordNotFound {
// 			return nil, nil
// 		}
// 		return nil, err
// 	}

// 	existingSale.Salesperson = sale.Salesperson
// 	existingSale.SalesType = sale.SalesType
// 	existingSale.Status = sale.Status
// 	existingSale.Commission = sale.Commission
// 	existingSale.Date = sale.Date
// 	existingSale.CustomerName = sale.CustomerName
// 	existingSale.CustomerPhone = sale.CustomerPhone
// 	existingSale.Description = sale.Description
// 	existingSale.RecordingURL = sale.RecordingURL
// 	existingSale.UpdatedAt = sale.UpdatedAt
// 	existingSale.UpdatedBy = sale.UpdatedBy

// 	if err := sr.db.Save(&existingSale).Error; err != nil {
// 		return nil, err
// 	}

// 	var updated models.SaleModel
// 	err = sr.db.
// 		Preload("SalespersonData").
// 		Preload("User").
// 		First(&updated, "sales_id = ?", sale.SalesID).Error

// 	if err != nil {
// 		return nil, err
// 	}

//		return updated.SaleFromModelToDomain(), nil
//	}
func (sr *SaleRepository) UpdateSale(ctx context.Context, sale *domain.Sale) (*domain.Sale, error) {
	var existingSale models.SaleModel

	err := sr.db.
		Preload("SalespersonData").
		Preload("User").
		First(&existingSale, "sales_id = ?", sale.SalesID).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	updates := map[string]interface{}{}

	if sale.Salesperson != uuid.Nil {
		updates["salesperson"] = sale.Salesperson
	}

	if sale.SalesType != "" {
		updates["sales_type"] = sale.SalesType
	}

	if sale.Status != "" {
		updates["status"] = sale.Status
	}

	if sale.Commission != nil {
		updates["commission"] = *sale.Commission
	}

	if !sale.Date.IsZero() {
		updates["date"] = sale.Date
	}

	if sale.CustomerName != "" {
		updates["customer_name"] = sale.CustomerName
	}

	if sale.CustomerPhone != "" {
		updates["customer_phone"] = sale.CustomerPhone
	}

	if sale.Description != "" {
		updates["description"] = sale.Description
	}

	if sale.RecordingURL != "" {
		updates["recording_url"] = sale.RecordingURL
	}

	updates["updated_at"] = sale.UpdatedAt
	updates["updated_by"] = sale.UpdatedBy

	if err := sr.db.Model(&existingSale).Updates(updates).Error; err != nil {
		return nil, err
	}

	var updated models.SaleModel
	err = sr.db.
		Preload("SalespersonData").
		Preload("User").
		First(&updated, "sales_id = ?", sale.SalesID).Error

	if err != nil {
		return nil, err
	}

	return updated.SaleFromModelToDomain(), nil
}

func (sr *SaleRepository) DeleteSale(ctx context.Context, sale *domain.Sale) (*domain.Sale, error) {
	var saleModel models.SaleModel
	err := sr.db.First(&saleModel, "sales_id = ?", sale.SalesID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, err
		}
		return nil, err
	}
	err = sr.db.Delete(&saleModel).Error
	if err != nil {
		logger.Error(ctx, "Error deleting sale", zap.String("method", "DELETE"), zap.String("path", "/sales/:sale-id"), zap.Any("saleID", sale.SalesID), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Sale deleted", zap.String("method", "DELETE"), zap.String("path", "/sales/:sale-id"), zap.Any("saleID", sale.SalesID))
	return saleModel.SaleFromModelToDomain(), nil
}

func (sr *SaleRepository) GetSaleByID(ctx context.Context, sale *domain.Sale) (*domain.Sale, error) {
	var saleModel models.SaleModel
	err := sr.db.WithContext(ctx).
		Preload("SalespersonData").
		Preload("User").
		First(&saleModel, "sales_id = ?", sale.SalesID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return saleModel.SaleFromModelToDomain(), nil
}

func (sr *SaleRepository) GetSalesList(ctx context.Context, query string, limit int, offset int) ([]*domain.Sale, error) {
	var sales []models.SaleModel

	search := "%" + query + "%"

	tx := sr.db.
		Preload("SalespersonData").
		Preload("User").
		Where(`sales_no ILIKE ?`, search)

	// Pagination
	if err := tx.Limit(limit).
		Offset(offset).
		Order("sales.created_at DESC").
		Find(&sales).Error; err != nil {
		return nil, err
	}

	// Convert to domain
	var domainSales []*domain.Sale
	for _, s := range sales {
		domainSale := s.SaleFromModelToDomain()

		// map salesperson
		domainSale.SalespersonData = s.SalespersonData.SalespersonFromModelToDomain()

		domainSales = append(domainSales, domainSale)
	}

	return domainSales, nil
}
