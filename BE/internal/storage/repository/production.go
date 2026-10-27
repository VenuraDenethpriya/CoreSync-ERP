package repository

import (
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/models"
	"CoreSync-backend/internal/service/domain"
	"context"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ProductionRepository struct {
	db *gorm.DB
}

func NewProductionRepository(db *gorm.DB) *ProductionRepository {
	return &ProductionRepository{
		db,
	}
}

func (pr *ProductionRepository) CreateCasings(ctx context.Context, casings []*domain.Casing) ([]*domain.Casing, error) {
	casingModels := models.CasingModelsFromDomainSlice(casings)

	if err := pr.db.WithContext(ctx).Create(&casingModels).Error; err != nil {
		return nil, err
	}

	logger.Info(ctx, "Casings created", zap.String("method", "POST"), zap.String("path", "/casings"), zap.Int("count", len(casingModels)))
	return models.CasingModelsToDomainSlice(casingModels), nil
}

func (pr *ProductionRepository) GetCasings(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Casing, int64, error) {
	var totalCount int64
	var casingModels []*models.CasingModel

	tx := pr.db.WithContext(ctx).Model(&models.CasingModel{})

	if searchQuery != "" {
		searchPattern := "%" + searchQuery + "%"
		tx = tx.Joins("LEFT JOIN products ON casings.product_id = products.product_id")
		tx = tx.Where(`
			casings.serial_no ILIKE ? OR 
			products.name ILIKE ? OR 
			casings.note ILIKE ?`,
			searchPattern, searchPattern, searchPattern)
	}

	if err := tx.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	if err := tx.
		Select("casings.*").
		Preload("Product").
		Preload("User").
		Order("casings.created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&casingModels).Error; err != nil {
		return nil, 0, err
	}

	var domainCasings []*domain.Casing

	for _, c := range casingModels {
		domainCasings = append(domainCasings, models.CasingModelToDomain(c))
	}

	return domainCasings, totalCount, nil
}

func (pr *ProductionRepository) CreateWireHarness(ctx context.Context, wireHarness []*domain.WireHarness) ([]*domain.WireHarness, error) {
	wireHarnessModels := models.WireHarnessModelsFromDomainSlice(wireHarness)

	if err := pr.db.WithContext(ctx).Create(&wireHarnessModels).Error; err != nil {
		return nil, err
	}

	logger.Info(ctx, "Wire harness created", zap.String("method", "POST"), zap.String("path", "/wire-harness"), zap.Int("count", len(wireHarnessModels)))
	return models.WireHarnessModelsToDomainSlice(wireHarnessModels), nil
}

func (pr *ProductionRepository) GetWireHarness(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.WireHarness, int64, error) {
	var totalCount int64
	var wireHarnessModels []*models.WireHarnessModel

	tx := pr.db.WithContext(ctx).Model(&models.WireHarnessModel{})

	if searchQuery != "" {
		searchPattern := "%" + searchQuery + "%"
		tx = tx.Joins("LEFT JOIN products ON wire_harness.product_id = products.product_id")
		tx = tx.Where(`
			wire_harness.serial_no ILIKE ? OR 
			products.name ILIKE ? OR 
			wire_harness.note ILIKE ?`,
			searchPattern, searchPattern, searchPattern)
	}

	if err := tx.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	if err := tx.
		Select("wire_harness.*").
		Preload("Product").
		Preload("User").
		Order("wire_harness.created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&wireHarnessModels).Error; err != nil {
		return nil, 0, err
	}

	var domainWireHarness []*domain.WireHarness

	for _, c := range wireHarnessModels {
		domainWireHarness = append(domainWireHarness, models.WireHarnessModelToDomain(c))
	}
	return domainWireHarness, totalCount, nil
}
