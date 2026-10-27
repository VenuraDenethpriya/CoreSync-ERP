package repository

import (
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/models"
	"CoreSync-backend/internal/service/domain"
	"context"
	"crypto/rand"
	"fmt"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type InventoryOrderRepository struct {
	db *gorm.DB
}

func NewInventoryOrderRepository(db *gorm.DB) *InventoryOrderRepository {
	return &InventoryOrderRepository{
		db,
	}
}

func generateOrderNo() string {
	b := make([]byte, 4)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("INV-%d", time.Now().Unix())
	}
	return fmt.Sprintf("INV-%X", b)
}

func (io *InventoryOrderRepository) CreateInventoryOrder(ctx context.Context, inventoryOrder *domain.InventoryOrder) (*domain.InventoryOrder, error) {
	inventoryOrderModel := models.InventoryOrderModelFromDomain(inventoryOrder)

	if inventoryOrderModel.OrderNo == "" {
		inventoryOrderModel.OrderNo = generateOrderNo()
	}

	if err := io.db.Create(inventoryOrderModel).Error; err != nil {
		logger.Error(ctx, "Error creating inventory order", zap.String("method", "POST"), zap.String("path", "order"), zap.Any("inventory order", inventoryOrder), zap.Error(err))
		return nil, err
	}

	var userModel models.UserModel
	if err := io.db.First(&userModel, "clerk_id = ?", inventoryOrderModel.CreatedBy).Error; err == nil {
		inventoryOrderModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", inventoryOrderModel.CreatedBy), zap.Error(err))
	}

	logger.Info(ctx, "Inventory order created", zap.String("method", "POST"), zap.String("path", "order"), zap.Any("inventory order", inventoryOrder))

	return inventoryOrderModel.InventoryOrderModelToDomain(), nil
}

func (ur *InventoryOrderRepository) GetInventoryOrders(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.InventoryOrder, int, error) {
	var inventoryOrderModels []models.InventoryOrderModel
	var totalCount int64

	db := ur.db.Model(&models.InventoryOrderModel{})
	db = db.Where("status NOT IN ?", []string{"Received", "Checked", "Rejected"})

	if searchQuery != "" {
		searchPattern := "%" + searchQuery + "%"
		db = db.Where("item_code ILIKE ? OR item_name ILIKE ? OR status ILIKE ? OR order_no ILIKE ? OR CAST(amount AS TEXT) ILIKE ? OR CAST(order_quantity AS TEXT) ILIKE ?",
			searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)
	}

	if err := db.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	if err := db.Limit(limit).Offset(offset).Order("created_at DESC").Find(&inventoryOrderModels).Error; err != nil {
		return nil, 0, err
	}

	var domainInventories []*domain.InventoryOrder
	for _, i := range inventoryOrderModels {
		item := i
		domainInventories = append(domainInventories, item.InventoryOrderModelToDomain())
	}

	return domainInventories, int(totalCount), nil
}

func (ur *InventoryOrderRepository) DeleteInventoryOrder(ctx context.Context, inventoryOrder *domain.InventoryOrder) (*domain.InventoryOrder, error) {
	var inventoryOrderModel models.InventoryOrderModel
	err := ur.db.First(&inventoryOrderModel, inventoryOrder.ID).Error
	if err != nil {
		return nil, err
	}
	err = ur.db.Delete(&inventoryOrderModel).Error
	if err != nil {
		return nil, err
	}
	return inventoryOrderModel.InventoryOrderModelToDomain(), nil
}

func (ur *InventoryOrderRepository) UpdateInventoryOrder(ctx context.Context, inventoryOrder *domain.InventoryOrder) (*domain.InventoryOrder, error) {
	var inventoryOrderModel models.InventoryOrderModel
	err := ur.db.First(&inventoryOrderModel, inventoryOrder.ID).Error
	if err != nil {
		return nil, err
	}

	inventoryOrderModel.ItemCode = inventoryOrder.ItemCode
	inventoryOrderModel.ItemName = inventoryOrder.ItemName
	inventoryOrderModel.OrderQuantity = inventoryOrder.OrderQuantity
	inventoryOrderModel.Quantity = inventoryOrder.Quantity
	inventoryOrderModel.Amount = inventoryOrder.Amount
	inventoryOrderModel.Status = inventoryOrder.Status
	inventoryOrderModel.OrderDate = inventoryOrder.OrderDate

	err = ur.db.Updates(&inventoryOrderModel).Error

	if err != nil {
		logger.Error(ctx, "Error updating inventory order", zap.String("method", "PUT"), zap.String("path", "orders"), zap.Any("inventory order", inventoryOrder), zap.Error(err))
		return nil, err
	}

	logger.Info(ctx, "Inventory updated", zap.String("method", "PUT"), zap.String("path", "inventory"), zap.Any("inventory", inventoryOrder))
	return inventoryOrderModel.InventoryOrderModelToDomain(), nil
}

func (ur *InventoryOrderRepository) GetInventoryReceivedOrders(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.InventoryOrder, int, error) {
	var inventoryOrderModels []models.InventoryOrderModel
	var totalCount int64

	db := ur.db.Model(&models.InventoryOrderModel{})

	statuses := []string{"Received", "Checked"}
	db = db.Where("status IN ?", statuses)

	if searchQuery != "" {
		searchPattern := "%" + searchQuery + "%"
		db = db.Where("item_code ILIKE ? OR item_name ILIKE ? OR status ILIKE ? OR order_no ILIKE ? OR CAST(amount AS TEXT) ILIKE ? OR CAST(order_quantity AS TEXT) ILIKE ?",
			searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)
	}

	if err := db.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	if err := db.Limit(limit).Offset(offset).Order("created_at DESC").Find(&inventoryOrderModels).Error; err != nil {
		return nil, 0, err
	}

	var domainInventories []*domain.InventoryOrder
	for _, i := range inventoryOrderModels {
		item := i
		domainInventories = append(domainInventories, item.InventoryOrderModelToDomain())
	}

	return domainInventories, int(totalCount), nil
}

func (ur *InventoryOrderRepository) IncrementOrderQuantity(ctx context.Context, tx *gorm.DB, orderID uuid.UUID, quantityToAdd int) error {
	err := tx.WithContext(ctx).
		Model(&models.InventoryOrderModel{}).
		Where("id = ?", orderID).
		Update("quantity", gorm.Expr("quantity + ?", quantityToAdd)).Error

	if err != nil {
		return err
	}
	return nil
}
