package models

import (
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"

	"gorm.io/gorm"
)

type PaymentModel struct {
	ID          uuid.UUID          `gorm:"primary_key"`
	User        UserModel          `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user"`
	OrderID     uuid.UUID          `gorm:"type:uuid;not null REFERENCES orders(order_id)"`
	Order       OrderModel         `gorm:"foreignKey:OrderID;references:OrderID" json:"order"`
	PaymentType domain.PaymentType `gorm:"not null"`
	Amount      float64            `gorm:"not null"`
	LoanAmount  float64            `gorm:"default:0"`
	PaidDate    string             `gorm:"not null"`
	Image       string             `gorm:"null"`
	CreatedBy   string             `gorm:"not null"`
}

func (p *PaymentModel) BeforeCreate(_ *gorm.DB) (err error) {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return
}
func (p *PaymentModel) TableName() string {
	return "order_payments"
}
func (p *PaymentModel) PaymentModelToDomain() *domain.Payment {
	return PaymentModelToDomain(p)
}

func PaymentModelFromDomain(payment *domain.Payment) *PaymentModel {
	if payment == nil {
		return nil
	}

	paymentModel := &PaymentModel{
		ID:          payment.ID,
		OrderID:     payment.OrderID,
		PaymentType: payment.PaymentType,
		Amount:      payment.Amount,
		LoanAmount:  payment.LoanAmount,
		PaidDate:    payment.PaidDate,
		Image:       payment.Image,
		CreatedBy:   payment.CreatedBy,
	}

	return paymentModel
}

func PaymentModelToDomain(model *PaymentModel) *domain.Payment {
	return &domain.Payment{
		ID:          model.ID,
		User:        model.User.UserModelToDomain(),
		OrderID:     model.OrderID,
		Order:       model.Order.OrderModelToDomain(),
		PaymentType: model.PaymentType,
		Amount:      model.Amount,
		LoanAmount:  model.LoanAmount,
		PaidDate:    model.PaidDate,
		Image:       model.Image,
		CreatedBy:   model.CreatedBy,
	}
}
