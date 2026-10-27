package repository

import (
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/models"
	"CoreSync-backend/internal/service/domain"
	"context"
	"encoding/json"
	"errors"
	"fmt"

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
	// orderItemModel.ProductID = orderItem.ProductID
	// orderItemModel.Quantity = orderItem.Quantity
	// orderItemModel.UnitPrice = orderItem.UnitPrice
	// orderItemModel.SubTotal = orderItem.SubTotal
	// orderItemModel.Note = orderItem.Note
	err = ur.db.Model(&orderItemModel).Updates(map[string]interface{}{
		"product_id": orderItem.ProductID,
		"quantity":   orderItem.Quantity,
		"unit_price": orderItem.UnitPrice,
		// "sub_total":  orderItem.SubTotal,
		"note": orderItem.Note,
	}).Error

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

func (r *OrderItemRepository) GetAllPacks(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.OrderItem, int64, error) {
	var packs []*models.OrderItemModel
	var totalCount int64

	tx := r.db.Model(&models.OrderItemModel{}).
		Joins("JOIN products ON products.product_id = order_items.product_id").
		Where("products.category = ?", "BATTERY_PACK").
		Where("order_items.serial_no IS NOT NULL")
		// Where("order_items.status != 'Delivered'")

	if searchQuery != "" {
		searchPattern := "%" + searchQuery + "%"
		tx = tx.Where(`
            order_items.serial_no ILIKE ? OR 
            products.name ILIKE ? OR 
            order_items.status ILIKE ? OR 
            order_items.note ILIKE ?`,
			searchPattern, searchPattern, searchPattern, searchPattern)
	}

	if err := tx.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	if err := tx.
		Select("order_items.*").
		Preload("Product").
		Order("order_items.created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&packs).Error; err != nil {
		return nil, 0, err
	}

	var domainPacks []*domain.OrderItem
	for _, p := range packs {
		domainPacks = append(domainPacks, p.OrderItemModelToDomain())
	}

	return domainPacks, totalCount, nil
}

func (r *OrderItemRepository) GetPackById(ctx context.Context, pack *domain.OrderItem) (*domain.OrderItem, error) {
	var packModel models.OrderItemModel

	err := r.db.
		Preload("Product").
		Preload("Order").
		Preload("Casing").
		Preload("WireHarness").
		First(&packModel, "id = ?", pack.ID).
		Error
	if err != nil {
		return nil, err
	}

	domainPack := packModel.OrderItemModelToDomain()
	return domainPack, nil
}

func (r *OrderItemRepository) UpdatePack(ctx context.Context, pack *domain.OrderItem) (*domain.OrderItem, error) {
	var packModel models.OrderItemModel

	err := r.db.First(&packModel, "id = ?", pack.ID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("pack record with ID %s not found", pack.ID)
		}
		return nil, err
	}

	updateData := models.OrderItemModel{
		Status:   pack.Status,
		OrderNo:  pack.OrderNo,
		SerialNo: pack.SerialNo,
		Priority: pack.Priority,
	}

	if err := r.db.Model(&packModel).Updates(updateData).Error; err != nil {
		return nil, err
	}

	return packModel.OrderItemModelToDomain(), nil
}

func (r *OrderItemRepository) UpdatePackOrderID(ctx context.Context, pack *domain.OrderItem) (*domain.OrderItem, error) {
	var packModelA models.OrderItemModel

	err := r.db.Transaction(func(tx *gorm.DB) error {

		if err := tx.First(&packModelA, "id = ?", pack.ID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("pack record with ID %s not found", pack.ID)
			}
			return err
		}

		var targetOrder models.OrderModel
		if err := tx.Select("Items").First(&targetOrder, "order_id = ?", pack.NewOrderID).Error; err != nil {
			return err
		}

		var targetOrderSummary []domain.OrderItemSummary
		if len(targetOrder.Items) > 0 {
			_ = json.Unmarshal(targetOrder.Items, &targetOrderSummary)
		}

		requestedQty := 0
		for _, item := range targetOrderSummary {
			if item.ProductID == packModelA.ProductID {
				requestedQty = item.Quantity
				break
			}
		}

		var currentAssignedCount int64
		tx.Model(&models.OrderItemModel{}).
			Where("order_no = ? AND product_id = ?", pack.NewOrderID, packModelA.ProductID).
			Count(&currentAssignedCount)

		if currentAssignedCount >= int64(requestedQty) && requestedQty > 0 {
			var packModelB models.OrderItemModel
			err := tx.Where("order_no = ? AND product_id = ?", pack.NewOrderID, packModelA.ProductID).First(&packModelB).Error

			if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}

			if packModelB.ID != uuid.Nil {
				if pack.ExistingOrderID == uuid.Nil {
					packModelB.OrderNo = nil
				} else {
					packModelB.OrderNo = &pack.ExistingOrderID
				}

				if err := tx.Model(&packModelB).Update("order_no", packModelB.OrderNo).Error; err != nil {
					return err
				}
			}
		}

		packModelA.OrderNo = &pack.NewOrderID
		if err := tx.Model(&packModelA).Update("order_no", packModelA.OrderNo).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return packModelA.OrderItemModelToDomain(), nil
}

func (ur *OrderItemRepository) DeleteUnassignedBatteryPacks(ctx context.Context, productID uuid.UUID, limit int) error {
	var ids []uuid.UUID

	err := ur.db.Model(&models.OrderItemModel{}).
		Where("product_id = ? AND order_no IS NULL AND status = 'Drafted'", productID).
		Limit(limit).
		Pluck("id", &ids).Error

	if err != nil || len(ids) == 0 {
		return err
	}

	return ur.db.Delete(&models.OrderItemModel{}, ids).Error
}

func (r *OrderItemRepository) UpdatePackProduction(ctx context.Context, pack *domain.OrderItem) (*domain.OrderItem, error) {
	var packModel models.OrderItemModel

	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&packModel, "id = ?", pack.ID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("pack record with ID %s not found", pack.ID)
			}
			return err
		}

		// 2. Build dynamic updates map for only the fields that were provided
		updates := map[string]interface{}{}

		if pack.CasingID != nil {
			updates["casings_id"] = *pack.CasingID
		}
		if pack.WireHarnessID != nil {
			updates["wire_harness_id"] = *pack.WireHarnessID
		}

		// 3. Perform the update if there are fields to update
		if len(updates) > 0 {
			if err := tx.Model(&models.OrderItemModel{}).Where("id = ?", pack.ID).Updates(updates).Error; err != nil {
				return err
			}
		}

		// 4. Preload associations so the returned domain object has Product/Order info for logs
		if err := tx.Preload("Product").Preload("Name").Preload("Order").First(&packModel, "id = ?", pack.ID).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return packModel.OrderItemModelToDomain(), nil
}
func (ur *OrderItemRepository) DeletePack(ctx context.Context, packID uuid.UUID) (*domain.OrderItem, error) {
	var orderItemModel models.OrderItemModel

	if err := ur.db.First(&orderItemModel, "id = ?", packID).Error; err != nil {
		return nil, err
	}

	err := ur.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("pack_id = ?", packID).Delete(&models.InventoryItemAllocateModel{}).Error; err != nil {
			return err
		}

		if err := tx.Where("id = ?", packID).Delete(&models.OrderItemModel{}).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return orderItemModel.OrderItemModelToDomain(), nil
}
