package models

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InventoryItemRestockModel struct {
	ID        uuid.UUID            `gorm:"type:uuid;primary_key" json:"id"`
	Items     []InventoryItemModel `gorm:"foreignKey:RestockID" json:"items"`
	User      UserModel            `gorm:"foreignKey:UserName;references:ClerkID" json:"user"`
	ItemID    uuid.UUID            `gorm:"type:uuid;foreignKey:ItemID;references:ID" json:"item_id"`
	Inventory InventoryModel       `gorm:"foreignKey:ItemID;references:ID"`
	Amount    float64              `gorm:"type:float;not null" json:"amount"`
	Quantity  int                  `gorm:"type:int;not null" json:"quantity"`
	UnitPrice float64              `gorm:"type:float;not null" json:"unit_price"`
	UserName  string               `gorm:"type:varchar(100);not null" json:"user_name"`
	Remark    string               `gorm:"type:varchar(100);not null" json:"remark"`
	IsPrint   bool                 `gorm:"type:boolean;default:false" json:"is_print"`
	CreatedAt time.Time            `gorm:"autoCreateTime" json:"created_at"`
}

func (i *InventoryItemRestockModel) BeforeCreate(_ *gorm.DB) (err error) {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return
}

func (i *InventoryItemRestockModel) TableName() string {
	return "inventory_item_restock"
}
func (i *InventoryItemRestockModel) InventoryItemRestockModelToDomain() *domain.InventoryItemRestock {
	return InventoryItemRestockModelToDomain(i)
}

func InventoryItemRestockModelFromDomain(restock *domain.InventoryItemRestock) *InventoryItemRestockModel {
	if restock == nil {
		return nil
	}
	return &InventoryItemRestockModel{
		ID:        restock.ID,
		ItemID:    restock.ItemID,
		Amount:    restock.Amount,
		Quantity:  restock.Quantity,
		UnitPrice: restock.UnitPrice,
		UserName:  restock.UserName,
		Remark:    restock.Remark,
		IsPrint:   restock.IsPrint,
		CreatedAt: restock.CreatedAt,
	}
}

func InventoryItemRestockModelToDomain(model *InventoryItemRestockModel) *domain.InventoryItemRestock {
	return &domain.InventoryItemRestock{
		ID:        model.ID,
		User:      model.User.UserModelToDomain(),
		ItemID:    model.ItemID,
		ItemCode:  model.Inventory.ItemCode,
		Amount:    model.Amount,
		Quantity:  model.Quantity,
		UnitPrice: model.UnitPrice,
		UserName:  model.UserName,
		Remark:    model.Remark,
		IsPrint:   model.IsPrint,
		CreatedAt: model.CreatedAt,
	}
}
