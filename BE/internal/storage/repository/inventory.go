package repository

import (
	"context"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"

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
func (ur *InventoryRepository) CreateInventory(ctx context.Context, inventory *domain.Inventory) (*domain.Inventory, error) {
	inventoryModel := models.InventoryModelFromDomain(inventory)
	if err := ur.db.Create(inventoryModel).Error; err != nil {
		logger.Error(ctx, "Error creating inventory", zap.String("method", "POST"), zap.String("path", "inventory"), zap.Any("inventory", inventory), zap.Error(err))
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", inventoryModel.CreatedBy).Error; err == nil {
		inventoryModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", inventoryModel.CreatedBy), zap.Error(err))
	}
	logger.Info(ctx, "Inventory created", zap.String("method", "POST"), zap.String("path", "inventory"), zap.Any("inventory", inventory))
	return inventoryModel.InventoryModelToDomain(), nil
}

// func (ur *InventoryRepository) GetInventory(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Inventory, int, error) {
// 	var inventoryModels []models.InventoryModel

// 	var whereClause string
// 	var args []interface{}

// 	searchPattern := "%" + searchQuery + "%"
// 	whereClause = ` WHERE item_code ILIKE ? OR item_name ILIKE ? OR status ILIKE ?`
// 	args = append(args, searchPattern, searchPattern, searchPattern)

//		// Count total matching products
//		var totalCount int64
//		countQuery := "SELECT COUNT(*) FROM inventory i" + whereClause
//		if err := ur.db.Raw(countQuery, args...).Scan(&totalCount).Error; err != nil {
//			return nil, 0, err
//		}
//		// Paginated query
//		baseQuery := `
//			SELECT i.*
//			FROM inventory i`
//		paginationClause := " ORDER BY created_at DESC LIMIT ? OFFSET ?"
//		argsWithPagination := append(args, limit, offset)
//		finalQuery := baseQuery + whereClause + paginationClause
//		if err := ur.db.Raw(finalQuery, argsWithPagination...).Scan(&inventoryModels).Error; err != nil {
//			return nil, 0, err
//		}
//		var domainInventories []*domain.Inventory
//		for _, i := range inventoryModels {
//			domainInventories = append(domainInventories, i.InventoryModelToDomain())
//		}
//		return domainInventories, int(totalCount), nil
//	}
// func (ur *InventoryRepository) GetInventory(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Inventory, int, error) {
// 	var inventoryModels []models.InventoryModel
// 	var totalCount int64

// 	searchPattern := "%" + searchQuery + "%"

// 	// Count total
// 	if err := ur.db.Model(&models.InventoryModel{}).
// 		Where("item_code ILIKE ? OR item_name ILIKE ? OR status ILIKE ?", searchPattern, searchPattern, searchPattern).
// 		Count(&totalCount).Error; err != nil {
// 		return nil, 0, err
// 	}

// 	// Fetch with preload allocations
// 	if err := ur.db.Preload("InventoryItemAllocates").
// 		Where("item_code ILIKE ? OR item_name ILIKE ? OR status ILIKE ?", searchPattern, searchPattern, searchPattern).
// 		Order("created_at DESC").
// 		Limit(limit).Offset(offset).
// 		Find(&inventoryModels).Error; err != nil {
// 		return nil, 0, err
// 	}

// 	// Map to domain
// 	var domainInventories []*domain.Inventory
// 	for _, i := range inventoryModels {
// 		domainInventories = append(domainInventories, i.InventoryModelToDomain())
// 	}

// 	return domainInventories, int(totalCount), nil
// }
// in your inventory_repository.go

func (ur *InventoryRepository) GetInventory(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Inventory, int, error) {
	var inventoryModels []models.InventoryModel
	var totalCount int64

	searchPattern := "%" + searchQuery + "%"
	db := ur.db.Model(&models.InventoryModel{}).
		Where("item_code ILIKE ? OR item_name ILIKE ? OR status ILIKE ?", searchPattern, searchPattern, searchPattern)

	// Count total records matching the filter
	if err := db.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	// Create the subquery to calculate the sum of allocations
	subQuery := ur.db.Model(&models.InventoryItemAllocateModel{}).
		Select("COALESCE(SUM(count), 0)").
		Where("item_id = inventory.id")

	// // Fetch inventory data and the calculated 'allocated' count
	if err := db.Select("inventory.*, (?) as allocated", subQuery).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&inventoryModels).Error; err != nil {
		return nil, 0, err
	}

	// Map to domain
	var domainInventories []*domain.Inventory
	for _, i := range inventoryModels {
		domainInventories = append(domainInventories, i.InventoryModelToDomain())
	}

	return domainInventories, int(totalCount), nil
}

func (ur *InventoryRepository) UpdateInventory(ctx context.Context, inventory *domain.Inventory) (*domain.Inventory, error) {
	var inventoryModel models.InventoryModel
	err := ur.db.First(&inventoryModel, inventory.ID).Error
	if err != nil {
		return nil, err
	}

	inventoryModel.ItemCode = inventory.ItemCode
	inventoryModel.ItemName = inventory.ItemName
	inventoryModel.QuantityInStock = inventory.QuantityInStock
	inventoryModel.UnitCost = inventory.UnitCost
	inventoryModel.Threshold = inventory.Threshold
	inventoryModel.Status = inventory.Status
	inventoryModel.ProductID = inventory.ProductID

	err = ur.db.Updates(&inventoryModel).Error

	if err != nil {
		logger.Error(ctx, "Error updating inventory", zap.String("method", "PUT"), zap.String("path", "inventory"), zap.Any("inventory", inventory), zap.Error(err))
		return nil, err
	}

	// if err := ur.db.WithContext(ctx).
	// 	Preload("Inventory").
	// 	Preload("Order").
	// 	Preload("User").
	// 	First(&inventoryModel, "id = ?", inventoryModel.ID).Error; err != nil {

	// 	logger.Error(ctx, "Failed to preload inventory and order data", zap.Error(err))
	// 	return nil, err
	// }
	logger.Info(ctx, "Inventory updated", zap.String("method", "PUT"), zap.String("path", "inventory"), zap.Any("inventory", inventory))
	return inventoryModel.InventoryModelToDomain(), nil
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
