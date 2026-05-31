package models

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CustomerModel struct {
	CustomerID uuid.UUID    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	User       UserModel    `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user"`
	Title      string       `gorm:"type:varchar(20);" json:"title"`
	FirstName  string       `gorm:"type:varchar(255) not null" json:"first_name"`
	LastName   string       `gorm:"type:varchar(255) not null" json:"last_name"`
	Address    string       `gorm:"type:varchar(255);" json:"address"`
	PhoneNo1   string       `gorm:"type:varchar(20);not null" json:"phone_no1"`
	PhoneNo2   string       `gorm:"type:varchar(20);not null" json:"phone_no2"`
	Email      string       `gorm:"type:varchar(255);" json:"email"`
	VatNo      string       `gorm:"type:varchar(255);" json:"VatNo"`
	CreatedBy  string       `gorm:"type:varchar(255);not null" json:"created_by"`
	CreatedAt  time.Time    `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time    `gorm:"autoUpdateTime" json:"updated_at"`
	Orders     []OrderModel `gorm:"foreignKey:CustomerID"`
	Quotes     []QuoteModel `gorm:"foreignKey:CustomerID"`
}

func (c *CustomerModel) BeforeCreate(_ *gorm.DB) (err error) {
	if c.CustomerID == uuid.Nil {
		c.CustomerID = uuid.New()
	}
	return
}

func (c *CustomerModel) TableName() string {
	return "customers"
}

func (c *CustomerModel) CustomerModelToDomain() *domain.Customer {
	return CustomerModelToDomain(c)
}

func CustomerModelFromDomain(customer *domain.Customer) *CustomerModel {
	return &CustomerModel{
		CustomerID: customer.CustomerID,
		Title:      customer.Title,
		FirstName:  customer.FirstName,
		LastName:   customer.LastName,
		Address:    customer.Address,
		PhoneNo1:   customer.PhoneNo1,
		PhoneNo2:   customer.PhoneNo2,
		Email:      customer.Email,
		VatNo:      customer.VatNo,
		CreatedBy:  customer.CreatedBy,
	}
}

func CustomerModelToDomain(model *CustomerModel) *domain.Customer {
	var lastOrderModel OrderModel
	var lastOrderInfo domain.LastOrderInfo
	if lastOrderModel.OrderID != uuid.Nil {

		lastOrderInfo = domain.LastOrderInfo{
			Type: lastOrderModel.Type,
			No:   lastOrderModel.OrderNo,
			Date: lastOrderModel.CreatedAt,
		}
	}
	// var domainOrders []domain.OrderInfo
	// for _, order := range model.Orders {
	// 	domainOrders = append(domainOrders, domain.OrderInfo{
	// 		Id:            order.OrderID,
	// 		Type:          order.Type,
	// 		No:            order.OrderNo,
	// 		OrderStatus:   order.OrderStatus,
	// 		PaymentStatus: order.PaymentStatus,
	// 		Total:         order.Total,
	// 	})
	// }
	var domainOrders []domain.OrderInfo
	for _, order := range model.Orders {
		var paidAmount float64
		for _, payment := range order.OrderPayments {
			paidAmount += payment.Amount
		}

		domainOrders = append(domainOrders, domain.OrderInfo{
			Id:            order.OrderID,
			Type:          order.Type,
			No:            order.OrderNo,
			OrderStatus:   order.OrderStatus,
			PaymentStatus: order.PaymentStatus,
			Total:         order.Total,
			PaidAmount:    paidAmount,
		})
	}

	var domainQuotes []domain.QuoteInfo
	for _, quote := range model.Quotes {
		domainQuotes = append(domainQuotes, domain.QuoteInfo{
			Id:     quote.QuoteID,
			Type:   quote.Type,
			No:     quote.QuoteNo,
			Status: quote.Status,
		})
	}

	return &domain.Customer{
		CustomerID: model.CustomerID,
		User:       model.User.UserModelToDomain(),
		Title:      model.Title,
		FirstName:  model.FirstName,
		LastName:   model.LastName,
		Address:    model.Address,
		PhoneNo1:   model.PhoneNo1,
		PhoneNo2:   model.PhoneNo2,
		Email:      model.Email,
		VatNo:      model.VatNo,
		CreatedBy:  model.CreatedBy,
		CreatedAt:  model.CreatedAt,
		UpdatedAt:  model.UpdatedAt,
		LastOrder:  lastOrderInfo,
		Orders:     domainOrders,
		Quotes:     domainQuotes,
	}
}
