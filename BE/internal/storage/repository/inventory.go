package repository

import (
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/models"
	"CoreSync-backend/internal/service/domain"
	"context"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type InventoryRepository struct {
	db *gorm.DB
}

func NewInventoryRepository(db *gorm.DB) *InventoryRepository {
	return &InventoryRepository{
		db,
	}
}

func (ur *InventoryRepository) CreateInventory(ctx context.Context, tx *gorm.DB, inventory *domain.Inventory) (*domain.Inventory, error) {
	inventoryModel := models.InventoryModelFromDomain(inventory)
	if err := tx.Create(inventoryModel).Error; err != nil {
		logger.Error(ctx, "Error creating inventory", zap.String("method", "POST"), zap.String("path", "inventory"), zap.Any("inventory", inventory), zap.Error(err))
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := tx.First(&userModel, "clerk_id = ?", inventoryModel.CreatedBy).Error; err == nil {
		inventoryModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", inventoryModel.CreatedBy), zap.Error(err))
	}
	logger.Info(ctx, "Inventory created", zap.String("method", "POST"), zap.String("path", "inventory"), zap.Any("inventory", inventory))
	return inventoryModel.InventoryModelToDomain(), nil
}

func (ur *InventoryRepository) GetInventory(ctx context.Context, searchQuery string, limit int, offset int, sellable *bool) ([]*domain.Inventory, int, error) {
	var inventoryModels []models.InventoryModel
	var totalCount int64

	searchPattern := "%" + searchQuery + "%"

	db := ur.db.Model(&models.InventoryModel{}).
		Where("item_code ILIKE ? OR item_name ILIKE ? OR status ILIKE ?", searchPattern, searchPattern, searchPattern)

	if sellable != nil {
		if *sellable {
			db = db.Where("product_id != '00000000-0000-0000-0000-000000000000'")
		} else {
			db = db.Where("product_id = '00000000-0000-0000-0000-000000000000'")
		}
	}

	if err := db.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	subQuery := ur.db.Model(&models.InventoryItemAllocateModel{}).
		Select("COALESCE(SUM(count), 0)").
		Where("item_id = inventory.id")

	if err := db.Select("inventory.*, (?) as allocated", subQuery).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&inventoryModels).Error; err != nil {
		return nil, 0, err
	}

	var domainInventories []*domain.Inventory
	for _, i := range inventoryModels {
		domainInventories = append(domainInventories, i.InventoryModelToDomain())
	}

	return domainInventories, int(totalCount), nil
}

func (ur *InventoryRepository) UpdateInventory(ctx context.Context, tx *gorm.DB, inventory *domain.Inventory, actingClerkID string) (*domain.Inventory, string, error) {
	var inventoryModel models.InventoryModel

	if err := tx.WithContext(ctx).First(&inventoryModel, "id = ?", inventory.ID).Error; err != nil {
		return nil, "", err
	}

	inventoryModel.ItemCode = inventory.ItemCode
	inventoryModel.ItemName = inventory.ItemName
	inventoryModel.QuantityInStock = inventory.QuantityInStock
	inventoryModel.UnitCost = inventory.UnitCost
	inventoryModel.Threshold = inventory.Threshold
	inventoryModel.Status = inventory.Status
	inventoryModel.ProductID = inventory.ProductID

	if err := tx.WithContext(ctx).Updates(&inventoryModel).Error; err != nil {
		logger.Error(ctx, "Error updating inventory", zap.Error(err))
		return nil, "", err
	}

	logger.Info(ctx, "Inventory updated", zap.Any("inventory_id", inventory.ID))

	return inventoryModel.InventoryModelToDomain(), "Inventory updated successfully", nil
}

func (ur *InventoryRepository) DeleteInventory(ctx context.Context, inventory *domain.Inventory) (*domain.Inventory, error) {
	var inventoryModel models.InventoryModel
	err := ur.db.First(&inventoryModel, inventory.ID).Error
	if err != nil {
		return nil, err
	}
	err = ur.db.Delete(&inventoryModel).Error
	if err != nil {
		return nil, err
	}
	return inventoryModel.InventoryModelToDomain(), nil
}

func (ur *InventoryRepository) GetInventoryById(ctx context.Context, inventory *domain.Inventory) (*domain.Inventory, error) {
	var inventoryModel models.InventoryModel
	err := ur.db.First(&inventoryModel, "id = ?", inventory.ID).Error
	if err != nil {
		return nil, err
	}
	domainInventory := inventoryModel.InventoryModelToDomain()
	return domainInventory, nil
}

func (ur *InventoryRepository) GetNonReservableInventory(ctx context.Context, searchQuery string, limit int) ([]*domain.Inventory, error) {
	var inventoryModels []models.InventoryModel

	searchPattern := "%" + searchQuery + "%"
	args := []interface{}{searchPattern, limit}

	query := `
		SELECT i.*
		FROM inventory i
		WHERE item_code ILIKE $1 AND product_id = '00000000-0000-0000-0000-000000000000'
		ORDER BY created_at DESC
		LIMIT $2
	`

	if err := ur.db.Raw(query, args...).Scan(&inventoryModels).Error; err != nil {
		return nil, err
	}

	var domainInventories []*domain.Inventory
	for _, i := range inventoryModels {
		domainInventories = append(domainInventories, i.InventoryModelToDomain())
	}

	return domainInventories, nil
}

func (ur *InventoryRepository) FindByCodeAndName(ctx context.Context, tx *gorm.DB, code, name string) (*domain.Inventory, error) {
	var model models.InventoryModel
	// Use tx instead of ur.db
	err := tx.WithContext(ctx).Where("item_code = ? AND item_name = ?", code, name).First(&model).Error
	if err != nil {
		return nil, err
	}
	return model.InventoryModelToDomain(), nil
}
