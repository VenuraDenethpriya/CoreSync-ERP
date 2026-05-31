package repository

import (
	"context"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type CallRepository struct {
	db *gorm.DB
}

func NewCallRepository(db *gorm.DB) *CallRepository {
	return &CallRepository{db: db}
}
func (cr *CallRepository) CreateCall(ctx context.Context, call *domain.Call) (*domain.Call, error) {
	var createdCallModel *models.CallModel
	err := cr.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		callModel := models.CallFromDomain(call)
		createdCallModel = callModel
		if err := tx.Create(callModel).Error; err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		logger.Error(ctx, "Error creating call", zap.String("method", "POST"), zap.String("path", "/calls"), zap.Any("call", call), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Call created", zap.String("method", "POST"), zap.String("path", "/calls"), zap.Any("call", createdCallModel))
	return createdCallModel.CallFromModelToDomain(), nil
}

func (cr *CallRepository) GetCalls(ctx context.Context, query string, limit int, offset int) ([]*domain.Call, int, error) {
	var callModels []models.CallModel
	search := "%" + query + "%"

	tx := cr.db.Model(&models.CallModel{}).
		Preload("Salesperson").
		Joins("LEFT JOIN salespersons as salesperson ON salesperson.phone_no = calls.agent_cli").
		Where(`
            calls.customer_cli ILIKE ? 
            OR calls.status ILIKE ? 
            OR salesperson.first_name ILIKE ? 
            OR salesperson.last_name ILIKE ?`,
			search, search, search, search)

	var totalCalls int64
	if err := tx.Count(&totalCalls).Error; err != nil {
		return nil, 0, err
	}

	if err := tx.Limit(limit).
		Offset(offset).
		Order("calls.created_at DESC").
		Find(&callModels).Error; err != nil {
		return nil, 0, err
	}

	var domainCalls []*domain.Call
	for _, c := range callModels {
		domainCalls = append(domainCalls, c.CallFromModelToDomain())
	}
	return domainCalls, int(totalCalls), nil
}
