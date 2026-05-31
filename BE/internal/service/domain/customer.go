package domain

import (
	"time"

	"github.com/google/uuid"
)

type LastOrderInfo struct {
	Type string    `json:"last_order_type"`
	No   string    `json:"last_order_no"`
	Date time.Time `json:"last_order_date"`
}
type OrderInfo struct {
	Id            uuid.UUID `json:"id"`
	Type          string    `json:"order_type"`
	No            string    `json:"order_no"`
	OrderStatus   string    `json:"order_status"`
	PaymentStatus string    `json:"payment_status"`
	Total         float64   `json:"total"`
	PaidAmount    float64   `json:"paid_amount"`
}

type QuoteInfo struct {
	Id     uuid.UUID `json:"id"`
	Type   string    `json:"quote_type"`
	No     string    `json:"quote_no"`
	Status string    `json:"status"`
}

type Customer struct {
	CustomerID uuid.UUID `json:"id"`
	User       *User
	CreatedBy  string        `json:"created_by"`
	Title      string        `json:"title"`
	FirstName  string        `json:"first_name"`
	LastName   string        `json:"last_name"`
	Address    string        `json:"address"`
	PhoneNo1   string        `json:"phone_no1"`
	PhoneNo2   string        `json:"phone_no2"`
	Email      string        `json:"email"`
	VatNo      string        `json:"vat_no"`
	CreatedAt  time.Time     `json:"created_at"`
	UpdatedAt  time.Time     `json:"updated_at"`
	LastOrder  LastOrderInfo `json:"last_order"`
	Orders     []OrderInfo   `json:"orders"`
	Quotes     []QuoteInfo   `json:"quotes"`
}
