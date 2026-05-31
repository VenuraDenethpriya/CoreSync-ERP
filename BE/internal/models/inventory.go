package models

import (
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InventoryModel struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	User            UserModel `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user"`
	ItemCode        string    `gorm:"type:varchar(100);not null" json:"item_code"`
	ItemName        string    `gorm:"type:varchar(100);not null" json:"item_name"`
	QuantityInStock int       `gorm:"type:int;not null;default:0" json:"quantity_in_stock"`
	Hold            float64   `gorm:"type:decimal(10,2);not null" json:"hold"`
	UnitCost        float64   `gorm:"type:decimal(10,2);not null" json:"unit_cost"`
	Threshold       float64   `gorm:"type:decimal(10,2);not null" json:"threshold"`
	Status          string    `gorm:"type:varchar(100);not null" json:"status"`
	ProductID       uuid.UUID `gorm:"foreignKey:ProductID;references:ProductID" json:"product_id"`
	// InventoryItemAllocates []InventoryItemAllocateModel `gorm:"foreignKey:ItemID;references:ID"`
	Allocated int       `gorm:"->"`
	CreatedBy string    `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"created_by"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (i *InventoryModel) BeforeCreate(_ *gorm.DB) (err error) {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return
}
func (i *InventoryModel) TableName() string {
	return "inventory"
}
func (i *InventoryModel) InventoryModelToDomain() *domain.Inventory {
	return InventoryModelToDomain(i)
}
func InventoryModelFromDomain(inventory *domain.Inventory) *InventoryModel {
	return &InventoryModel{
		ID:              inventory.ID,
		ItemCode:        inventory.ItemCode,
		ItemName:        inventory.ItemName,
		QuantityInStock: inventory.QuantityInStock,
		Hold:            inventory.Hold,
		UnitCost:        inventory.UnitCost,
		Threshold:       inventory.Threshold,
		Status:          inventory.Status,
		ProductID:       inventory.ProductID,
		CreatedBy:       inventory.CreatedBy,
	}
}

//	func InventoryModelToDomain(model *InventoryModel) *domain.Inventory {
//		return &domain.Inventory{
//			ID:              model.ID,
//			ItemCode:        model.ItemCode,
//			ItemName:        model.ItemName,
//			QuantityInStock: model.QuantityInStock,
//			UnitCost:        model.UnitCost,
//			Threshold:       model.Threshold,
//			Status:          model.Status,
//			ProductID:       model.ProductID,
//			Allocated:       model.InventoryItemAllocate.Count,
//			CreatedAt:       model.CreatedAt,
//			UpdatedAt:       model.UpdatedAt,
//		}
//	}
func InventoryModelToDomain(model *InventoryModel) *domain.Inventory {
	// allocatedCount := 0
	// for _, alloc := range model.InventoryItemAllocates {
	// 	allocatedCount += alloc.Count
	// }

	return &domain.Inventory{
		ID:              model.ID,
		User:            model.User.UserModelToDomain(),
		ItemCode:        model.ItemCode,
		ItemName:        model.ItemName,
		QuantityInStock: model.QuantityInStock,
		Hold:            model.Hold,
		UnitCost:        model.UnitCost,
		Threshold:       model.Threshold,
		Status:          model.Status,
		ProductID:       model.ProductID,
		Allocated:       model.Allocated,
		CreatedBy:       model.CreatedBy,
		CreatedAt:       model.CreatedAt,
		UpdatedAt:       model.UpdatedAt,
	}
}

func UpdateInventoryRequestToDomain(req *dto.UpdateInventoryRequest) *domain.Inventory {
	return &domain.Inventory{
		ItemCode:        req.ItemCode,
		ItemName:        req.ItemName,
		QuantityInStock: req.QuantityInStock,
		UnitCost:        req.UnitCost,
		Threshold:       req.Threshold,
		Status:          req.Status,
		ProductID:       req.ProductId,
	}
}
func UpdateInventoryResponseToDomain(req *dto.UpdateInventoryResponse) *domain.Inventory {
	return &domain.Inventory{
		ItemCode:        req.ItemCode,
		ItemName:        req.ItemName,
		QuantityInStock: req.QuantityInStock,
		UnitCost:        req.UnitCost,
		Threshold:       req.Threshold,
		Status:          req.Status,
		ProductID:       req.ProductID,
		CreatedAt:       req.CreatedAt,
		UpdatedAt:       req.UpdatedAt,
	}
}
