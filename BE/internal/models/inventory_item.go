package models

import (
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InventoryItemModel struct {
	ID uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`

	Inventory InventoryModel `gorm:"foreignKey:ItemID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL" json:"inventory"`
	ItemID uuid.UUID `gorm:"type:uuid;column:item_id" json:"item_id"`

	RestockID uuid.UUID `gorm:"type:uuid;column:restock_id" json:"restock_id"`
	ItemCode  string    `gorm:"type:varchar(100);column:item_code" json:"item_code"`
}

func (i *InventoryItemModel) BeforeCreate(_ *gorm.DB) (err error) {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return
}
func (i *InventoryItemModel) TableName() string {
	return "inventory_item"
}

func (i *InventoryItemModel) InventoryItemModelToDomain() *domain.InventoryItem {
	return InventoryItemModelToDomain(i)
}

func InventoryItemModelFromDomain(inventoryItem *domain.InventoryItem) *InventoryItemModel {
	return &InventoryItemModel{
		ID:        inventoryItem.ID,
		ItemID:    inventoryItem.ItemID,
		RestockID: inventoryItem.RestockID,
		ItemCode:  inventoryItem.ItemCode,
	}
}
func InventoryItemModelToDomain(model *InventoryItemModel) *domain.InventoryItem {
	return &domain.InventoryItem{
		ID:        model.ID,
		ItemID:    model.ItemID,
		RestockID: model.RestockID,
		ItemCode:  model.ItemCode,
		// ItemName:  model.ItemName,
	}
}

func MapToDomain(models []InventoryItemUsageModel) []*domain.InventoryItemUsage {
	var out []*domain.InventoryItemUsage
	for _, m := range models {
		out = append(out, m.InventoryItemUsageModelToDomain())
	}
	return out
}
