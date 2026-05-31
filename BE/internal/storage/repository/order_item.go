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

type OrderItemRepository struct {
	db *gorm.DB
}

func NewOrderItemRepository(db *gorm.DB) *OrderItemRepository {
	return &OrderItemRepository{
		db,
	}
}
func (ur *OrderItemRepository) CreateOrderItem(ctx context.Context, orderItem *domain.OrderItem) (*domain.OrderItem, error) {
	orderItemModel := models.OrderItemModelFromDomain(orderItem)
	if err := ur.db.Create(orderItemModel).Error; err != nil {
		logger.Error(ctx, "Error creating order item", zap.String("method", "POST"), zap.String("path", "orders"), zap.Any("order", orderItem), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Order item created", zap.String("method", "POST"), zap.String("path", "orders"), zap.Any("order", orderItem))
	return orderItemModel.OrderItemModelToDomain(), nil
}

func (ur *OrderItemRepository) UpdateOrderItem(ctx context.Context, orderItem *domain.OrderItem) (*domain.OrderItem, error) {
	var orderItemModel models.OrderItemModel
	err := ur.db.First(&orderItemModel, orderItem.ID).Error
	if err != nil {
		return nil, err
	}
	orderItemModel.ProductID = orderItem.ProductID
	orderItemModel.Quantity = orderItem.Quantity
	orderItemModel.UnitPrice = orderItem.UnitPrice
	orderItemModel.SubTotal = orderItem.SubTotal
	orderItemModel.Note = orderItem.Note

	err = ur.db.Updates(&orderItemModel).Error

	if err != nil {
		logger.Error(ctx, "Error updating order item", zap.String("method", "PUT"), zap.String("path", "orders"), zap.Any("order item", orderItem), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Order item updated", zap.String("method", "PUT"), zap.String("path", "orders"), zap.Any("order item", orderItem))
	return orderItemModel.OrderItemModelToDomain(), nil
}

func (r *OrderItemRepository) GetOrderItemsByOrderID(ctx context.Context, orderID uuid.UUID) ([]*domain.OrderItem, error) {
	var models []models.OrderItemModel
	err := r.db.Where("order_no = ?", orderID).Find(&models).Error
	if err != nil {
		return nil, err
	}
	var domainItems []*domain.OrderItem
	for _, m := range models {
		domainItems = append(domainItems, m.OrderItemModelToDomain())
	}
	return domainItems, nil
}

func (r *OrderItemRepository) DeleteOrderItemByID(ctx context.Context, itemID uuid.UUID) error {
	return r.db.Delete(&models.OrderItemModel{}, itemID).Error
}
