package models

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RepairItemUsageModel struct {
	ID   uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	User UserModel `gorm:"foreignKey:UserName;references:ClerkID" json:"user"`

	ItemID        uuid.UUID          `gorm:"type:uuid;column:item_id" json:"item_id"`
	InventoryItem InventoryItemModel `gorm:"foreignKey:ItemID;references:ID"`
	Inventory     InventoryModel     `gorm:"foreignKey:ItemID;references:ID"`
	ItemCode      string             `gorm:"->;-:migration;column:item_code"`
	RepairID      uuid.UUID          `gorm:"type:uuid;column:repair_id" json:"repair_id"`
	Repair        RepairModel        `gorm:"foreignKey:RepairID;references:ID"`
	UserName      string             `gorm:"type:varchar(100);column:user_name" json:"user_name"`
	CreatedAt     time.Time          `gorm:"autoCreateTime" json:"created_at"`
}

func (i *RepairItemUsageModel) BeforeCreate(_ *gorm.DB) (err error) {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return
}
func (i *RepairItemUsageModel) TableName() string {
	return "repair_item_usage"
}
func (i *RepairItemUsageModel) RepairItemUsageModelToDomain() *domain.RepairItemUsage {
	return RepairItemUsageModelToDomain(i)
}
func RepairItemUsageModelFromDomain(repairItemUsage *domain.RepairItemUsage) *RepairItemUsageModel {
	if repairItemUsage == nil {
		return nil
	}
	return &RepairItemUsageModel{
		ID:       repairItemUsage.ID,
		ItemID:   repairItemUsage.ItemID,
		RepairID: repairItemUsage.RepairID,
		// UsageCount: repairItemUsage.UsageCount,
		UserName:  repairItemUsage.UserName,
		CreatedAt: repairItemUsage.CreatedAt,
	}
}

func RepairItemUsageModelToDomain(model *RepairItemUsageModel) *domain.RepairItemUsage {
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

	return &domain.RepairItemUsage{
		ID:   model.ID,
		User: domainUser,

		InventoryID:   inventoryID,
		InventoryCode: inventoryCode,
		InventoryName: inventoryName,

		ItemID:   model.ItemID,
		ItemCode: itemCode,

		RepairID: model.RepairID,
		JobNo:    model.Repair.JobNo,
		// UsageCount: model.UsageCount,
		UserName:  model.UserName,
		CreatedAt: model.CreatedAt,
	}
}

func MapRepairUsageModelsToDomain(models []*RepairItemUsageModel) []*domain.RepairItemUsage {
	out := make([]*domain.RepairItemUsage, 0, len(models))
	for _, m := range models {
		out = append(out, RepairItemUsageModelToDomain(m))
	}
	return out
}
