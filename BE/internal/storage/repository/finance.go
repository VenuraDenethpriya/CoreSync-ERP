package repository

import (
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/models"
	"CoreSync-backend/internal/service/domain"
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type FinanceRepository struct {
	db *gorm.DB
}

func NewFinanceRepository(db *gorm.DB) *FinanceRepository {
	return &FinanceRepository{
		db: db,
	}
}

func generatePurchaseNo() string {
	dateStr := time.Now().Format("20060102")
	randomStr := strings.ToUpper(uuid.New().String()[:3])
	return fmt.Sprintf("PO-%s-%s", dateStr, randomStr)
}

func (fr *FinanceRepository) CreatePurchaseOrder(ctx context.Context, purchaseOrder *domain.Finance) (*domain.Finance, error) {
	financeModel := models.FinanceModelFromDomain(purchaseOrder)

	if financeModel.PurchaseNo == "" {
		financeModel.PurchaseNo = generatePurchaseNo()
	}

	if err := fr.db.Create(financeModel).Error; err != nil {
		logger.Error(ctx, "Error creating purchase order: ", zap.String("method", "POST"), zap.String("path", "finance"), zap.Any("finance", purchaseOrder), zap.Error(err))
		return nil, err
	}

	logger.Info(ctx, "Purchase order created", zap.String("method", "POST"), zap.String("path", "finance"), zap.Any("finance", purchaseOrder))

	return financeModel.FinanceModelToDomain(), nil
}
func (fr *FinanceRepository) GetPurchaseOrders(ctx context.Context, query string, limit int, offset int) ([]*domain.Finance, int, error) {
	var financeModels []models.FinanceModel
	var total int64

	dbQuery := fr.db.WithContext(ctx).Model(&models.FinanceModel{})

	if query != "" {
		searchStr := "%" + query + "%"
		dbQuery = dbQuery.Where("purchase_no ILIKE ? OR department ILIKE ? OR status ILIKE ?", searchStr, searchStr, searchStr).Preload("User")
	}

	if err := dbQuery.Count(&total).Error; err != nil {
		logger.Error(ctx, "Failed to count purchase orders", zap.Error(err))
		return nil, 0, err
	}

	if limit > 0 {
		dbQuery = dbQuery.Limit(limit)
	}
	if offset > 0 {
		dbQuery = dbQuery.Offset(offset)
	}

	if err := dbQuery.Order("created_at DESC").Find(&financeModels).Error; err != nil {
		logger.Error(ctx, "Failed to fetch purchase orders", zap.Error(err))
		return nil, 0, err
	}

	domainFinances := make([]*domain.Finance, 0, len(financeModels))
	for i := range financeModels {
		domainFinances = append(domainFinances, financeModels[i].FinanceModelToDomain())
	}

	return domainFinances, int(total), nil
}

func (fr *FinanceRepository) GetPurchaseOrderByID(ctx context.Context, purchaseOrder *domain.Finance) (*domain.Finance, error) {
	var financeModel models.FinanceModel

	err := fr.db.WithContext(ctx).
		Preload("User").
		Preload("Creator").
		Preload("Updater").
		Where("id = ?", purchaseOrder.ID).
		First(&financeModel).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Error(ctx, "Purchase order not found", zap.String("id", purchaseOrder.ID.String()))
			return nil, err
		}
		logger.Error(ctx, "Error retrieving purchase order by ID", zap.Error(err))
		return nil, err
	}

	return financeModel.FinanceModelToDomain(), nil
}

func (fr *FinanceRepository) DeletePurchaseOrder(ctx context.Context, purchaseOrder *domain.Finance) (*domain.Finance, error) {
	var existingPurchaseOrder models.FinanceModel
	err := fr.db.First(&existingPurchaseOrder, "id = ?", purchaseOrder.ID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	if err := fr.db.Delete(&existingPurchaseOrder).Error; err != nil {
		logger.Error(ctx, "Error deleting purchase order: ", zap.String("method", "DELETE"), zap.String("path", "finance"), zap.Any("finance", existingPurchaseOrder), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Purchase order deleted", zap.String("method", "DELETE"), zap.String("path", "finance"), zap.Any("finance", existingPurchaseOrder))
	return existingPurchaseOrder.FinanceModelToDomain(), nil
}

func (fr *FinanceRepository) UpdatePurchaseOrder(ctx context.Context, purchaseOrder *domain.Finance) (*domain.Finance, error) {
	var existingPurchaseOrder models.FinanceModel
	err := fr.db.First(&existingPurchaseOrder, "id = ?", purchaseOrder.ID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	existingPurchaseOrder.ID = purchaseOrder.ID
	existingPurchaseOrder.IsTransferred = purchaseOrder.IsTransferred
	existingPurchaseOrder.UpdatedBy = &purchaseOrder.UpdatedBy
	existingPurchaseOrder.Status = purchaseOrder.Status

	if err := fr.db.Updates(&existingPurchaseOrder).Error; err != nil {
		logger.Error(ctx, "Error updating purchase order: ", zap.String("method", "PUT"), zap.String("path", "finance"), zap.Any("purchase order", purchaseOrder), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "purchase order updated", zap.String("method", "PUT"), zap.String("path", "finance"), zap.Any("purchase order", purchaseOrder))
	return existingPurchaseOrder.FinanceModelToDomain(), nil
}

func (fr *FinanceRepository) GetPurchaseItems(ctx context.Context, query string, limit int, offset int) ([]*domain.Finance, int, error) {
	var financeModels []models.FinanceModel
	var total int64

	dbQuery := fr.db.WithContext(ctx).Model(&models.FinanceModel{})

	if query != "" {
		searchStr := "%" + query + "%"
		dbQuery = dbQuery.Where("purchase_no ILIKE ? OR department ILIKE ? OR status ILIKE ? OR items::text ILIKE ?", searchStr, searchStr, searchStr, searchStr).Preload("User")
	}

	if err := dbQuery.Count(&total).Error; err != nil {
		logger.Error(ctx, "Failed to count itms", zap.Error(err))
		return nil, 0, err
	}

	if limit > 0 {
		dbQuery = dbQuery.Limit(limit)
	}
	if offset > 0 {
		dbQuery = dbQuery.Offset(offset)
	}

	if err := dbQuery.Order("created_at DESC").Find(&financeModels).Error; err != nil {
		logger.Error(ctx, "Failed to fetch items", zap.Error(err))
		return nil, 0, err
	}

	domainFinances := make([]*domain.Finance, 0, len(financeModels))
	for i := range financeModels {
		domainFinances = append(domainFinances, financeModels[i].FinanceModelToDomain())
	}

	return domainFinances, int(total), nil
}
