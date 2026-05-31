package models

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InventoryItemAllocateModel struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
	User      UserModel      `gorm:"foreignKey:Allocator;references:ClerkID" json:"user"`
	ItemID    uuid.UUID      `gorm:"type:uuid;foreignKey:ItemID;references:ID" json:"item_id"`
	Inventory InventoryModel `gorm:"foreignKey:ItemID;references:ID"`
	OrderID   uuid.UUID      `gorm:"type:uuid;foreignKey:OrderID;references:OrderID" json:"order_id"`
	Count     int            `gorm:"type:int;not null" json:"count"`
	Order     OrderModel     `gorm:"foreignKey:OrderID;references:OrderID"`
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
	return &InventoryItemAllocateModel{
		ID:        inventoryItemAllocate.ID,
		ItemID:    inventoryItemAllocate.ItemID,
		OrderID:   inventoryItemAllocate.OrderID,
		Count:     inventoryItemAllocate.Count,
		Allocator: inventoryItemAllocate.Allocator,
		CreatedAt: inventoryItemAllocate.CreatedAt,
	}
}
func InventoryItemAllocateModelToDomain(model *InventoryItemAllocateModel) *domain.InventoryItemAllocate {
	return &domain.InventoryItemAllocate{
		ID:        model.ID,
		User:      model.User.UserModelToDomain(),
		ItemID:    model.ItemID,
		ItemCode:  model.Inventory.ItemCode,
		ItemName:  model.Inventory.ItemName,
		OrderID:   model.OrderID,
		OrderType: model.Order.Type,
		OrderNo:   model.Order.OrderNo,
		Count:     model.Count,
		Allocator: model.Allocator,
		CreatedAt: model.CreatedAt,
	}
}
