package domain

import (
	"time"

	"github.com/google/uuid"
)

type AdditionalChargeForQuote struct {
	Type  string  `json:"type"`
	Value float64 `json:"value"`
}

type Quote struct {
	QuoteID           uuid.UUID `json:"id"`
	Type              string    `json:"type"`
	CustomerID        uuid.UUID `gorm:"foreignKey:CustomerID" json:"customer_id"`
	SalesID           uuid.UUID `gorm:"foreignKey:SalesID" json:"SalesID"`
	Customer          *Customer
	User              *User
	Sale              *Sale
	CreatedBy         string                     `json:"created_by"`
	QuoteNo           string                     `json:"quote_no"`
	SubTotal          float64                    `json:"subtotal"`
	AdditionalCharges []AdditionalChargeForQuote `json:"additional_charges"`
	Discount          float64                    `json:"discount"`
	Total             float64                    `json:"total"`
	Vat               bool                       `json:"vat"`
	IsCatalog         bool                       `json:"is_catalog"`
	Status            string                     `json:"status"`
	QuoteItems        []QuoteItem                `json:"quote_items"`
	PoNo              string                     `json:"po_no"`
	CreatedAt         time.Time                  `json:"created_at"`
	UpdatedAt         time.Time                  `json:"updated_at"`
}

type QuoteItem struct {
	ID          uuid.UUID `json:"id"`
	QuoteNo     uuid.UUID `gorm:"foreignKey:QuoteNo" json:"quote_no"`
	ProductID   uuid.UUID `gorm:"foreignKey:ProductID" json:"product_id"`
	ProductName *Product  `gorm:"foreignKey:ProductID" json:"product_name"`
	Quantity    int       `json:"quantity"`
	UnitPrice   float64   `json:"unit_price"`
	SubTotal    float64   `json:"subtotal"`
	Note        string    `json:"note"`
	CreatedAt   time.Time `json:"created_at"`
}
