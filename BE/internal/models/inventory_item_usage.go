package models

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InventoryItemUsageModel struct {
	ID            uuid.UUID          `gorm:"type:uuid;primary_key" json:"id"`
	User          UserModel          `gorm:"foreignKey:UserName;references:ClerkID" json:"user"`
	ItemID        uuid.UUID          `gorm:"type:uuid;column:item_id" json:"item_id"`
	InventoryItem InventoryItemModel `gorm:"foreignKey:ItemID;references:ID"`
	Inventory     InventoryModel     `gorm:"foreignKey:ItemID;references:ID"`
	ItemCode      string             `gorm:"->;-:migration;column:item_code"`
	OrderID       *uuid.UUID         `gorm:"type:uuid;column:order_id" json:"order_id"`
	Order         OrderModel         `gorm:"foreignKey:OrderID;references:OrderID"`
	PackID        *uuid.UUID         `gorm:"type:uuid;column:pack_id" json:"packc_id"`
	OrderItem     OrderItemModel     `gorm:"foreignKey:PackID;references:ID"`
	UserName      string             `gorm:"type:varchar(100);column:user_name" json:"user_name"`
	CreatedAt     time.Time          `gorm:"autoCreateTime" json:"created_at"`
}

func (i *InventoryItemUsageModel) BeforeCreate(_ *gorm.DB) (err error) {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return
}
func (i *InventoryItemUsageModel) TableName() string {
	return "inventory_item_usage"
}
func (i *InventoryItemUsageModel) InventoryItemUsageModelToDomain() *domain.InventoryItemUsage {
	return InventoryItemUsageModelToDomain(i)
}
func InventoryItemUsageModelFromDomain(inventoryItemUsage *domain.InventoryItemUsage) *InventoryItemUsageModel {
	if inventoryItemUsage == nil {
		return nil
	}
	var orderIDPtr *uuid.UUID
	if inventoryItemUsage.OrderID != uuid.Nil {
		val := inventoryItemUsage.OrderID
		orderIDPtr = &val
	}

	var packIDPtr *uuid.UUID
	if inventoryItemUsage.PackID != uuid.Nil {
		val := inventoryItemUsage.PackID
		packIDPtr = &val
	}
	return &InventoryItemUsageModel{
		ID:      inventoryItemUsage.ID,
		ItemID:  inventoryItemUsage.ItemID,
		OrderID: orderIDPtr,
		PackID:  packIDPtr,
		// UsageCount: inventoryItemUsage.UsageCount,
		UserName:  inventoryItemUsage.UserName,
		CreatedAt: inventoryItemUsage.CreatedAt,
	}
}

func InventoryItemUsageModelToDomain(model *InventoryItemUsageModel) *domain.InventoryItemUsage {
	var itemCode, inventoryCode, inventoryName string
	var inventoryID uuid.UUID

	if model.ItemCode != "" {
		itemCode = model.ItemCode
	} else if model.InventoryItem.ItemCode != "" {
		itemCode = model.InventoryItem.ItemCode
	}

	if model.InventoryItem.ID != uuid.Nil {
		inventoryID = model.InventoryItem.ItemID

		if model.InventoryItem.Inventory.ID != uuid.Nil {
			inventoryCode = model.InventoryItem.Inventory.ItemCode
			inventoryName = model.InventoryItem.Inventory.ItemName
		}
	}

	var domainUser *domain.User
	if model.User.ClerkID != "" {
		domainUser = model.User.UserModelToDomain()
	}

	var domainOrderID, domainPackID uuid.UUID
	if model.OrderID != nil {
		domainOrderID = *model.OrderID
	}
	if model.PackID != nil {
		domainPackID = *model.PackID
	}

	return &domain.InventoryItemUsage{
		ID:   model.ID,
		User: domainUser,

		InventoryID:   inventoryID,
		InventoryCode: inventoryCode,
		InventoryName: inventoryName,

		ItemID:   model.ItemID,
		ItemCode: itemCode,

		OrderID:   domainOrderID,
		OrderType: model.Order.Type,
		OrederNo:  model.Order.OrderNo,
		PackID:    domainPackID,
		SerialNo:  model.OrderItem.SerialNo,
		// UsageCount: model.UsageCount,
		UserName:  model.UserName,
		CreatedAt: model.CreatedAt,
	}
}

func MapUsageModelsToDomain(models []*InventoryItemUsageModel) []*domain.InventoryItemUsage {
	out := make([]*domain.InventoryItemUsage, 0, len(models))
	for _, m := range models {
		out = append(out, InventoryItemUsageModelToDomain(m))
	}
	return out
}
