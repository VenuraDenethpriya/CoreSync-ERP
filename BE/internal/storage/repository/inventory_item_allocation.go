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

type InventoryItemAllocationRepository struct {
	db *gorm.DB
}

func NewInventoryItemAllocationRepostitory(db *gorm.DB) *InventoryItemAllocationRepository {
	return &InventoryItemAllocationRepository{
		db,
	}
}

func (ia *InventoryItemAllocationRepository) CreateInventoryItemAllocation(ctx context.Context, inventoryItemAllocation *domain.InventoryItemAllocate) (*domain.InventoryItemAllocate, error) {
	allocateModel := models.InventoryItemAllocateModelFromDomain(inventoryItemAllocation)
	if err := ia.db.WithContext(ctx).Create(allocateModel).Error; err != nil {
		return nil, err
	}
	// Update inventory hold after allocation
	// if err := ia.db.WithContext(ctx).
	// 	Model(&models.InventoryModel{}).
	// 	Where("id = ?", inventoryItemAllocation.ItemID).
	// 	UpdateColumn("hold", gorm.Expr("hold + ?", inventoryItemAllocation.Count)).
	// 	Error; err != nil {
	// 	return nil, err
	// }
	if err := ia.db.WithContext(ctx).Debug().
		Model(&models.InventoryModel{}).
		Where("id = ?", inventoryItemAllocation.ItemID).
		UpdateColumn("hold", gorm.Expr("hold + ?", inventoryItemAllocation.Count)).
		Error; err != nil {
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ia.db.First(&userModel, "clerk_id = ?", allocateModel.Allocator).Error; err == nil {
		allocateModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", allocateModel.Allocator), zap.Error(err))
	}
	var populatedAllocateModel models.InventoryItemAllocateModel
	if err := ia.db.WithContext(ctx).
		Preload("Inventory").
		Preload("Order").
		Preload("User").
		First(&populatedAllocateModel, "id = ?", allocateModel.ID).Error; err != nil {

		logger.Error(ctx, "Failed to preload inventory and order data", zap.Error(err))
		return nil, err
	}
	return populatedAllocateModel.InventoryItemAllocateModelToDomain(), nil
	// return models.InventoryItemAllocateModelToDomain(allocateModel), nil
}

func (iu *InventoryItemAllocationRepository) GetInventoryItemAllocation(
	ctx context.Context,
	orderID uuid.UUID,
	itemID uuid.UUID,
	limit int,
	offset int,
) ([]*domain.InventoryItemAllocate, int, error) {
	var allocateModels []models.InventoryItemAllocateModel

	query := iu.db.
		Preload("Inventory").
		Preload("Order").
		Preload("User")

	if orderID != uuid.Nil {
		query = query.Where("order_id = ?", orderID)
	}
	if itemID != uuid.Nil {
		query = query.Where("item_id = ?", itemID)
	}

	var total int64
	if err := query.Model(&models.InventoryItemAllocateModel{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if total == 0 {
		return []*domain.InventoryItemAllocate{}, 0, nil
	}

	if err := query.Limit(limit).Offset(offset).Find(&allocateModels).Error; err != nil {
		return nil, 0, err
	}

	var domainAllocations []*domain.InventoryItemAllocate
	for _, allocationModel := range allocateModels {
		domainAllocations = append(domainAllocations, allocationModel.InventoryItemAllocateModelToDomain())
	}

	return domainAllocations, int(total), nil
}

// func (iu *InventoryItemAllocationRepository) DeleteInventoryItemAllocation(ctx context.Context, allocation *domain.InventoryItemAllocate) (*domain.InventoryItemAllocate, error) {
// 	var allocationModel models.InventoryItemAllocateModel

// 	err := iu.db.First(&allocationModel, "id = ?", allocation.ID).Error

// 	if err != nil {
// 		return nil, err
// 	}

// 	err = iu.db.Delete(&allocationModel).Error
// 	if err != nil {
// 		return nil, err
// 	}
// 	if err := iu.db.WithContext(ctx).Debug().
// 		Model(&models.InventoryModel{}).
// 		Where("id = ?", allocation.ItemID).
// 		UpdateColumn("hold", gorm.Expr("hold - ?", allocation.Count)).
// 		Error; err != nil {
// 		return nil, err
// 	}

// 	var populatedAllocateModel models.InventoryItemAllocateModel
// 	if err := iu.db.WithContext(ctx).
// 		Preload("Inventory").
// 		Preload("Order").
// 		Preload("User").
// 		First(&populatedAllocateModel, "id = ?", allocation.ID).Error; err != nil {

//			logger.Error(ctx, "Failed to preload inventory and order data", zap.Error(err))
//			return nil, err
//		}
//		return populatedAllocateModel.InventoryItemAllocateModelToDomain(), nil
//		// return allocationModel.InventoryItemAllocateModelToDomain(), nil
//	}

func (ia *InventoryItemAllocationRepository) DeleteInventoryItemAllocation(ctx context.Context, allocation *domain.InventoryItemAllocate) (*domain.InventoryItemAllocate, error) {
	tx := ia.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var populatedAllocateModel models.InventoryItemAllocateModel
	if err := tx.WithContext(ctx).
		Preload("Inventory").
		Preload("Order").
		Preload("User").
		First(&populatedAllocateModel, "id = ?", allocation.ID).Error; err != nil {
		tx.Rollback()
		logger.Error(ctx, "Failed to find allocation record for deletion", zap.Error(err))
		return nil, err
	}

	populatedDomainObject := populatedAllocateModel.InventoryItemAllocateModelToDomain()

	if err := tx.WithContext(ctx).Delete(&models.InventoryItemAllocateModel{}, "id = ?", allocation.ID).Error; err != nil {
		tx.Rollback()
		logger.Error(ctx, "Failed to delete inventory item allocation", zap.Error(err))
		return nil, err
	}

	if err := tx.WithContext(ctx).Debug().
		Model(&models.InventoryModel{}).
		Where("id = ?", populatedAllocateModel.ItemID).
		UpdateColumn("hold", gorm.Expr("hold - ?", populatedAllocateModel.Count)).
		Error; err != nil {
		tx.Rollback()
		logger.Error(ctx, "Failed to update inventory hold", zap.Error(err))
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		logger.Error(ctx, "Error committing transaction", zap.Error(err))
		return nil, err
	}

	logger.Info(ctx, "Inventory item allocation deleted and hold updated", zap.Any("allocation", populatedDomainObject))

	return populatedDomainObject, nil
}

func (iu *InventoryItemAllocationRepository) UpdateInventoryItemAllocation(ctx context.Context, inventoryItemAllocate *domain.InventoryItemAllocate) (*domain.InventoryItemAllocate, error) {
	var allocateModel models.InventoryItemAllocateModel

	err := iu.db.First(&allocateModel, "id = ?", inventoryItemAllocate.ID).Error
	if err != nil {
		return nil, err
	}

	allocateModel.Count = inventoryItemAllocate.Count
	err = iu.db.Updates(&allocateModel).Error
	if err != nil {
		return nil, err
	}
	if err := iu.db.WithContext(ctx).Debug().
		Model(&models.InventoryModel{}).
		Where("id = ?", inventoryItemAllocate.ItemID).
		UpdateColumn("hold", gorm.Expr("hold - ? + ?", inventoryItemAllocate.OldCount, inventoryItemAllocate.Count)).
		Error; err != nil {
		return nil, err
	}

	if err := iu.db.WithContext(ctx).
		Preload("Inventory").
		First(&allocateModel, "item_id = ?", allocateModel.ItemID).Error; err != nil {

		logger.Error(ctx, "Failed to preload inventory and order data", zap.Error(err))
		return nil, err
	}
	return allocateModel.InventoryItemAllocateModelToDomain(), nil
}
