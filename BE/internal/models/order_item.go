package models

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderItemModel struct {
	ID            uuid.UUID   `gorm:"type:uuid;primary_key" json:"id"`
	Order         *OrderModel `gorm:"foreignKey:OrderNo;references:OrderID"`
	OrderNo       *uuid.UUID  `gorm:"type:uuid;foreignKey:OrderNo" json:"order_no"`
	ProductID     uuid.UUID   `gorm:"type:uuid" json:"product_id"`
	Product       *ProductModel
	CasingID      *uuid.UUID        `gorm:"type:uuid;column:casings_id" json:"casing_id"`
	Casing        *CasingModel      `gorm:"foreignKey:CasingID;references:ID"`
	WireHarnessID *uuid.UUID        `gorm:"type:uuid;column:wire_harness_id" json:"wire_harness_id"`
	WireHarness   *WireHarnessModel `gorm:"foreignKey:WireHarnessID;references:ID"`
	Name          ProductModel      `gorm:"foreignKey:ProductID;references:ProductID" json:"product_name"`
	Quantity      int               `json:"quantity"`
	UnitPrice     float64           `json:"unit_price"`
	// SubTotal  float64      `json:"subtotal"`
	Note      string    `json:"note"`
	SerialNo  string    `json:"serial_no"`
	Priority  string    `gorm:"default:Medium" json:"priority"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
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
		ID:            orderItem.ID,
		OrderNo:       orderItem.OrderNo,
		ProductID:     orderItem.ProductID,
		CasingID:      orderItem.CasingID,
		WireHarnessID: orderItem.WireHarnessID,
		Product:       productModel,
		Quantity:      orderItem.Quantity,
		UnitPrice:     orderItem.UnitPrice,
		// SubTotal:  orderItem.SubTotal,
		SerialNo: orderItem.SerialNo,
		Priority: orderItem.Priority,
		Status:   orderItem.Status,
		Note:     orderItem.Note,
	}
}

func OrderItemModelToDomain(model *OrderItemModel) *domain.OrderItem {
	// var domainProduct *domain.Product
	// if model.Product != nil {
	// 	domainProduct = model.Product.ProductModelToDomain()
	// }
	var domainProduct *domain.Product

	if model.Name.ProductID != uuid.Nil {
		domainProduct = (&model.Name).ProductModelToDomain()
	} else if model.Product != nil {
		domainProduct = model.Product.ProductModelToDomain()
	}

	var domainOrder *domain.Order
	if model.Order != nil {
		domainOrder = &domain.Order{
			OrderID: model.Order.OrderID,
			Type:    model.Order.Type,
			OrderNo: model.Order.OrderNo,
		}
	}
	var domainCasing *domain.Casing
	if model.Casing != nil {
		domainCasing = CasingModelToDomain(model.Casing)
	}

	var domainWireHarness *domain.WireHarness
	if model.WireHarness != nil {
		domainWireHarness = WireHarnessModelToDomain(model.WireHarness)
	}

	return &domain.OrderItem{
		ID:            model.ID,
		Order:         domainOrder,
		OrderNo:       model.OrderNo,
		ProductID:     model.ProductID,
		Casing:        domainCasing,
		CasingID:      model.CasingID,
		WireHarness:   domainWireHarness,
		WireHarnessID: model.WireHarnessID,
		ProductName:   domainProduct,
		Quantity:      model.Quantity,
		UnitPrice:     model.UnitPrice,
		// SubTotal:    model.SubTotal,
		SerialNo:  model.SerialNo,
		Status:    model.Status,
		Priority:  model.Priority,
		Note:      model.Note,
		CreatedAt: model.CreatedAt,
	}
}
