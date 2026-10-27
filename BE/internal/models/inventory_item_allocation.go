package models

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InventoryItemAllocateModel struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
	User      UserModel      `gorm:"foreignKey:Allocator;references:ClerkID" json:"user"`
	ItemID    uuid.UUID      `gorm:"type:uuid;foreignKey:ItemID;references:ID" json:"item_id"`
	Inventory InventoryModel `gorm:"foreignKey:ItemID;references:ID"`
	OrderID   *uuid.UUID     `gorm:"type:uuid;foreignKey:OrderID;references:OrderID" json:"order_id"`
	PackID    *uuid.UUID     `gorm:"type:uuid;foreignKey:PackID;references:ID" json:"pack_id"`
	Count     int            `gorm:"type:int;not null" json:"count"`
	Order     OrderModel     `gorm:"foreignKey:OrderID;references:OrderID"`
	OrderItem OrderItemModel `gorm:"foreignKey:PackID;references:ID"`
	Allocator string         `gorm:"foreignKey:Allocator;references:ClerkID" json:"user_name"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"created_at"`
}

func (i *InventoryItemAllocateModel) BeforeCreate(_ *gorm.DB) (err error) {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return
}
func (i *InventoryItemAllocateModel) TableName() string {
	return "inventory_item_allocation"
}
func (i *InventoryItemAllocateModel) InventoryItemAllocateModelToDomain() *domain.InventoryItemAllocate {
	return InventoryItemAllocateModelToDomain(i)
}
func InventoryItemAllocateModelFromDomain(inventoryItemAllocate *domain.InventoryItemAllocate) *InventoryItemAllocateModel {
	if inventoryItemAllocate == nil {
		return nil
	}
	var orderID *uuid.UUID
	if inventoryItemAllocate.OrderID != uuid.Nil {
		orderID = &inventoryItemAllocate.OrderID
	}

	var packID *uuid.UUID
	if inventoryItemAllocate.PackID != uuid.Nil {
		packID = &inventoryItemAllocate.PackID
	}
	return &InventoryItemAllocateModel{
		ID:        inventoryItemAllocate.ID,
		ItemID:    inventoryItemAllocate.ItemID,
		OrderID:   orderID,
		PackID:    packID,
		Count:     inventoryItemAllocate.Count,
		Allocator: inventoryItemAllocate.Allocator,
		CreatedAt: inventoryItemAllocate.CreatedAt,
	}
}
func InventoryItemAllocateModelToDomain(model *InventoryItemAllocateModel) *domain.InventoryItemAllocate {
	var orderID uuid.UUID
	if model.OrderID != nil {
		orderID = *model.OrderID
	}

	var packID uuid.UUID
	if model.PackID != nil {
		packID = *model.PackID
	}
	return &domain.InventoryItemAllocate{
		ID:        model.ID,
		User:      model.User.UserModelToDomain(),
		ItemID:    model.ItemID,
		ItemCode:  model.Inventory.ItemCode,
		ItemName:  model.Inventory.ItemName,
		OrderID:   orderID,
		PackID:    packID,
		SerialNo:  model.OrderItem.SerialNo,
		OrderType: model.Order.Type,
		OrderNo:   model.Order.OrderNo,
		Count:     model.Count,
		Allocator: model.Allocator,
		CreatedAt: model.CreatedAt,
	}
}
