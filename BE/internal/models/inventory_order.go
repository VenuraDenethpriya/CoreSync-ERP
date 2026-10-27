package models

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InventoryOrderModel struct {
	ID            uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OrderNo       string    `gorm:"type:varchar(255)"`
	User          UserModel `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user"`
	ItemCode      string    `gorm:"type:varchar(100);not null" json:"item_code"`
	ItemName      string    `gorm:"type:varchar(100);not null" json:"item_name"`
	OrderQuantity int       `gorm:"type:int;not null;default:0" json:"orderquantity"`
	Quantity      int       `gorm:"type:int;not null;default:0" json:"quantity"`
	Amount        float64   `gorm:"type:decimal(10,2);not null" json:"amount"`
	Status        string    `gorm:"type:varchar(100);not null;default:Placed" json:"status"`
	OrderDate     string    `gorm:"type:varchar(255);" json:"order_date"`
	CreatedBy     string    `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"created_by"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (i *InventoryOrderModel) BeforeCreate(_ *gorm.DB) (err error) {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return
}
func (i *InventoryOrderModel) TableName() string {
	return "inventory_orders"
}
func (i *InventoryOrderModel) InventoryOrderModelToDomain() *domain.InventoryOrder {
	return InventoryOrderModelToDomain(i)
}
func InventoryOrderModelFromDomain(inventoryOrder *domain.InventoryOrder) *InventoryOrderModel {
	return &InventoryOrderModel{
		ID:            inventoryOrder.ID,
		ItemCode:      inventoryOrder.ItemCode,
		ItemName:      inventoryOrder.ItemName,
		OrderQuantity: inventoryOrder.OrderQuantity,
		Quantity:      inventoryOrder.Quantity,
		Amount:        inventoryOrder.Amount,
		Status:        inventoryOrder.Status,
		OrderDate:     inventoryOrder.OrderDate,
		CreatedBy:     inventoryOrder.CreatedBy,
	}
}

func InventoryOrderModelToDomain(model *InventoryOrderModel) *domain.InventoryOrder {

	return &domain.InventoryOrder{
		ID:            model.ID,
		OrderNo:       model.OrderNo,
		ItemCode:      model.ItemCode,
		ItemName:      model.ItemName,
		OrderQuantity: model.OrderQuantity,
		Quantity:      model.Quantity,
		Amount:        model.Amount,
		Status:        model.Status,
		OrderDate:     model.OrderDate,
		CreatedBy:     model.CreatedBy,
		CreatedAt:     model.CreatedAt,
		UpdatedAt:     model.UpdatedAt,
	}
}
