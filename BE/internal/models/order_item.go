package models

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderItemModel struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	OrderNo   uuid.UUID `gorm:"type:uuid;foreignKey:OrderNo" json:"order_no"`
	ProductID uuid.UUID `gorm:"type:uuid" json:"product_id"`
	Product   *ProductModel
	Name      ProductModel `gorm:"foreignKey:ProductID;references:ProductID" json:"product_name"`
	Quantity  int          `json:"quantity"`
	UnitPrice float64      `json:"unit_price"`
	SubTotal  float64      `json:"subtotal"`
	Note      string       `json:"note"`
	CreatedAt time.Time    `json:"created_at"`
}

func (o *OrderItemModel) BeforeCreate(_ *gorm.DB) (err error) {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return
}
func (o *OrderItemModel) TableName() string {
	return "order_items"
}
func (o *OrderItemModel) OrderItemModelToDomain() *domain.OrderItem {
	return OrderItemModelToDomain(o)
}

func OrderItemModelFromDomain(orderItem *domain.OrderItem) *OrderItemModel {
	if orderItem == nil {
		return nil
	}

	productModel := ProductModelFromDomain(orderItem.ProductName)

	return &OrderItemModel{
		ID:        orderItem.ID,
		OrderNo:   orderItem.OrderNo,
		ProductID: orderItem.ProductID,
		Product:   productModel,
		Quantity:  orderItem.Quantity,
		UnitPrice: orderItem.UnitPrice,
		SubTotal:  orderItem.SubTotal,
		Note:      orderItem.Note,
	}
}

func OrderItemModelToDomain(model *OrderItemModel) *domain.OrderItem {
	return &domain.OrderItem{
		ID:          model.ID,
		OrderNo:     model.OrderNo,
		ProductID:   model.ProductID,
		ProductName: model.Name.ProductModelToDomain(),
		Quantity:    model.Quantity,
		UnitPrice:   model.UnitPrice,
		SubTotal:    model.SubTotal,
		Note:        model.Note,
		CreatedAt:   model.CreatedAt,
	}
}
