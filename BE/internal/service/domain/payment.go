package domain

import (
	"github.com/google/uuid"
)

type PaymentType string

const (
	PaymentTypeAdvance    PaymentType = "Advance"
	paymentTypePartial    PaymentType = "Partial"
	PaymentTypeRefund     PaymentType = "Refund"
	PaymentTypeCreditNote PaymentType = "Credit Note"
	PaymentTypeNone       PaymentType = "None"
)

type Payment struct {
	ID          uuid.UUID `json:"id"`
	User        *User
	OrderID     uuid.UUID `json:"order_id"`
	Order       *Order
	PaymentType PaymentType `json:"payment_type"`
	Amount      float64     `json:"amount"`
	LoanAmount  float64     `json:"loan_amount"`
	PaidDate    string      `json:"paid_date"`
	Image       string      `json:"image"`
	CreatedBy   string      `json:"created_by"`
}
