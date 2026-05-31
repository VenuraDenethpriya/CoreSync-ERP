package repository

import (
	"context"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type InventoryItemRestockRepository struct {
	db *gorm.DB
}

func NewInventoryItemRestockRepository(db *gorm.DB) *InventoryItemRestockRepository {
	return &InventoryItemRestockRepository{db}
}

func (ir *InventoryItemRestockRepository) CreateInventoryItemRestock(ctx context.Context, tx *gorm.DB, inventoryItemRestock *domain.InventoryItemRestock) (*domain.InventoryItemRestock, error) {
	db := ir.db
	if tx != nil {
		db = tx
	}

	restockModel := models.InventoryItemRestockModelFromDomain(inventoryItemRestock)

	// 2. Create only the Restock Record
	if err := db.WithContext(ctx).Create(restockModel).Error; err != nil {
		return nil, err
	}

	var populatedRestockModel models.InventoryItemRestockModel
	if err := db.WithContext(ctx).
		Preload("Inventory").
		Preload("User").
		First(&populatedRestockModel, "id = ?", restockModel.ID).Error; err != nil {
		logger.Error(ctx, "Failed to preload inventory data", zap.Error(err))
		return nil, err
	}

	return populatedRestockModel.InventoryItemRestockModelToDomain(), nil
}

func (ir *InventoryItemRestockRepository) GetInventoryItemRestock(ctx context.Context, itemID uuid.UUID, limit int, offset int) ([]*domain.InventoryItemRestock, int, error) {
	var restockModels []models.InventoryItemRestockModel
	baseQuery := ir.db.Where("item_id = ?", itemID)

	var total int64
	if err := baseQuery.Model(&models.InventoryItemRestockModel{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		return []*domain.InventoryItemRestock{}, 0, nil
	}

	err := baseQuery.
		Preload("User").
		Preload("Items").
		Limit(limit).
		Offset(offset).
		Order("created_at desc").
		Find(&restockModels).Error

	if err != nil {
		return nil, 0, err
	}

	var domainRestocks []*domain.InventoryItemRestock
	for _, r := range restockModels {
		restock := r.InventoryItemRestockModelToDomain()

		for _, itemModel := range r.Items {
			restock.Items = append(restock.Items, domain.InventoryItem{
				ID:       itemModel.ID,
				ItemCode: itemModel.ItemCode,
			})
		}

		if r.User.ID != uuid.Nil {
			restock.User = r.User.UserModelToDomain()
		}

		domainRestocks = append(domainRestocks, restock)
	}

	return domainRestocks, int(total), nil
}
func (ir *InventoryItemRestockRepository) UpdateInventoryItemRestockPrintStatus(ctx context.Context, inventoryItemRestock *domain.InventoryItemRestock) (*domain.InventoryItemRestock, error) {
	var restockModel models.InventoryItemRestockModel
	err := ir.db.First(&restockModel, inventoryItemRestock.ID).Error
	if err != nil {
		return nil, err
	}
	restockModel.IsPrint = inventoryItemRestock.IsPrint

	err = ir.db.Updates(&restockModel).Error
	if err != nil {
		logger.Error(ctx, "Error updating inventory item restock print status", zap.String("method", "PUT"), zap.String("path", "inventory/restock"), zap.Any("inventoryItemRestock", inventoryItemRestock), zap.Error(err))
		return nil, err
	}
	var populatedRestockModel models.InventoryItemRestockModel
	if err := ir.db.WithContext(ctx).
		Preload("Inventory").
		Preload("User").
		First(&populatedRestockModel, "id = ?", restockModel.ID).Error; err != nil {
		logger.Error(ctx, "Failed to preload inventory data", zap.Error(err))
		return nil, err
	}
	return populatedRestockModel.InventoryItemRestockModelToDomain(), nil
}
