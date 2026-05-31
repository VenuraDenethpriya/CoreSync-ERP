package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type AdditionalCharge struct {
	Type  string  `json:"type"`
	Value float64 `json:"value"`
}
type AdditionalChargeList []AdditionalCharge

// func (a AdditionalChargeList) Value() (driver.Value, error) {
// 	return json.Marshal(a)
// }

func (a *AdditionalChargeList) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("invalid type for AdditionalChargeList")
	}
	return json.Unmarshal(bytes, a)
}

type CADFile struct {
	FileName []string `json:"file_name"`
	Email    []string `json:"email"`
	Quantity int      `json:"quantity"`
}

func (c CADFile) Value() (driver.Value, error) {
	return json.Marshal(c)
}

func (c *CADFile) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("invalid type for CADFile")
	}
	return json.Unmarshal(bytes, c)
}

type Designer struct {
	Email       []string `json:"email"`
	Description string   `json:"description"`
}

func (d Designer) Value() (driver.Value, error) {
	return json.Marshal(d)
}

func (d *Designer) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("invalid type for Designer")
	}
	return json.Unmarshal(bytes, d)
}

func (a AdditionalChargeList) Value() (driver.Value, error) {
	if len(a) == 0 {
		return []byte("[]"), nil
	}
	return json.Marshal(a)
}

type OrderModel struct {
	OrderID    uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	Type       string    `gorm:"type:varchar(255);not null;" json:"type"`
	CustomerID uuid.UUID `gorm:"type:uuid;foreign_Key:CustomerID" json:"customer_id"`
	// SalesID              uuid.UUID            `gorm:"type:uuid;foreign_Key:SalesID;references:ID" json:"sales_id"`
	SalesID              *uuid.UUID           `gorm:"type:uuid;foreignKey:SalesID" json:"SalesID"`
	Customer             CustomerModel        `gorm:"foreignKey:CustomerID;references:CustomerID" json:"customer"`
	User                 UserModel            `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user"`
	Sale                 SaleModel            `gorm:"foreignKey:SalesID;references:SalesID" json:"sale"`
	CreatedBy            string               `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"created_by"`
	OrderNo              string               `json:"order_no"`
	SubTotal             float64              `json:"subtotal"`
	AdditionalCharges    AdditionalChargeList `gorm:"type:jsonb" json:"additional_charges"`
	Discount             float64              `json:"discount"`
	Total                float64              `json:"total"`
	Vat                  bool                 `json:"vat"`
	OrderStatus          string               `gorm:"default:Drafted" json:"ProductStatus"`
	PaymentStatus        string               `json:"PaymentStatus"`
	ExpectedDeliveryDate time.Time            `json:"ExpectedDeliveryDate,omitempty"`
	OrderItems           []OrderItemModel     `gorm:"foreignKey:OrderNo;references:OrderID" json:"order_items"`
	// OrderItems    []OrderItemModel `gorm:"foreignKey:OrderID;references:OrderNo" json:"order_items"`
	OrderPayments []PaymentModel `gorm:"foreignKey:OrderID;references:OrderID" json:"order_payments"`
	// Assignee             []uuid.UUID          `gorm:"type:uuid;foreignKey:Assignee;references:ID" json:"assignee"`
	Assignee   datatypes.JSON `gorm:"type:jsonb" json:"assignee"`
	Supervisor string         `json:"supervisor"`
	CADFiles   CADFile        `gorm:"type:jsonb" json:"cad_files"`
	Designer   Designer       `gorm:"type:jsonb" json:"designer"`
	PoNo       string         `gorm:"type:text" json:"po_no"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
}

func (o *OrderModel) BeforeCreate(_ *gorm.DB) (err error) {
	if o.OrderID == uuid.Nil {
		o.OrderID = uuid.New()
	}
	return
}
func (q *OrderModel) TableName() string {
	return "orders"
}

func (q *OrderModel) OrderModelToDomain() *domain.Order {
	return OrderModelToDomain(q)
}

func ConvertAdditionalChargesFromDomain(domainCharges []domain.AdditionalCharge) []AdditionalCharge {
	var charges []AdditionalCharge
	for _, c := range domainCharges {
		charges = append(charges, AdditionalCharge{
			Type:  c.Type,
			Value: c.Value,
		})
	}
	return charges
}
func ConvertCADFileFromDomain(domainCADFile domain.CADFile) CADFile {
	return CADFile{
		FileName: domainCADFile.FileName,
		Email:    domainCADFile.Email,
		Quantity: domainCADFile.Quantity,
	}
}
func ConvertDesignerFromDomain(domainDesigner domain.Designer) Designer {
	return Designer{
		Email:       domainDesigner.Email,
		Description: domainDesigner.Description,
	}
}
func OrderModelFromDomain(quote *domain.Order) *OrderModel {
	assigneeJSON, _ := json.Marshal(quote.Assignee)
	var salesIDPtr *uuid.UUID
	if quote.SalesID != uuid.Nil {
		salesIDPtr = &quote.SalesID
	}
	return &OrderModel{
		OrderID:              quote.OrderID,
		Type:                 quote.Type,
		CustomerID:           quote.CustomerID,
		CreatedBy:            quote.CreatedBy,
		OrderNo:              quote.OrderNo,
		SubTotal:             quote.SubTotal,
		AdditionalCharges:    ConvertAdditionalChargesFromDomain(quote.AdditionalCharges),
		Discount:             quote.Discount,
		Total:                quote.Total,
		Vat:                  quote.Vat,
		OrderStatus:          quote.OrderStatus,
		PaymentStatus:        quote.PaymentStatus,
		ExpectedDeliveryDate: quote.ExpectedDeliveryDate,
		Assignee:             assigneeJSON,
		Supervisor:           quote.Supervisor,
		CADFiles:             ConvertCADFileFromDomain(quote.CADFiles),
		Designer:             ConvertDesignerFromDomain(quote.Designer),
		PoNo:                 quote.PoNo,
		SalesID:              salesIDPtr,
		CreatedAt:            quote.CreatedAt,
		UpdatedAt:            quote.UpdatedAt,
	}
}
func convertAdditionalChargesToDomain(modelCharges []AdditionalCharge) []domain.AdditionalCharge {
	var charges []domain.AdditionalCharge
	for _, c := range modelCharges {
		charges = append(charges, domain.AdditionalCharge{
			Type:  c.Type,
			Value: c.Value,
		})
	}
	return charges
}
func convertCADFileToDomain(modelCADFile CADFile) domain.CADFile {
	return domain.CADFile{
		FileName: modelCADFile.FileName,
		Email:    modelCADFile.Email,
		Quantity: modelCADFile.Quantity,
	}
}
func convertDesignerToDomain(modelDesigner Designer) domain.Designer {
	return domain.Designer{
		Email:       modelDesigner.Email,
		Description: modelDesigner.Description,
	}
}
func OrderModelToDomain(model *OrderModel) *domain.Order {
	var items []domain.OrderItem
	for _, item := range model.OrderItems {
		items = append(items, *item.OrderItemModelToDomain())
	}
	var payments []domain.Payment
	for _, p := range model.OrderPayments {
		payments = append(payments, *p.PaymentModelToDomain())
	}
	var assignees []string
	if len(model.Assignee) > 0 {
		_ = json.Unmarshal(model.Assignee, &assignees)
	}
	var salesID uuid.UUID
	if model.SalesID != nil {
		salesID = *model.SalesID
	}
	return &domain.Order{
		OrderID:              model.OrderID,
		Type:                 model.Type,
		CustomerID:           model.CustomerID,
		SalesID:              salesID,
		Customer:             model.Customer.CustomerModelToDomain(),
		User:                 model.User.UserModelToDomain(),
		Sale:                 model.Sale.SaleFromModelToDomain(),
		CreatedBy:            model.CreatedBy,
		OrderNo:              model.OrderNo,
		SubTotal:             model.SubTotal,
		AdditionalCharges:    convertAdditionalChargesToDomain(model.AdditionalCharges),
		Discount:             model.Discount,
		Total:                model.Total,
		Vat:                  model.Vat,
		OrderStatus:          model.OrderStatus,
		PaymentStatus:        model.PaymentStatus,
		OrderItems:           items,
		Payments:             payments,
		ExpectedDeliveryDate: model.ExpectedDeliveryDate,
		Assignee:             assignees,
		Supervisor:           model.Supervisor,
		CADFiles:             convertCADFileToDomain(model.CADFiles),
		Designer:             convertDesignerToDomain(model.Designer),
		PoNo:                 model.PoNo,
		CreatedAt:            model.CreatedAt,
		UpdatedAt:            model.UpdatedAt,
	}
}
