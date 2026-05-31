package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AdditionalChargeForQuote struct {
	Type  string  `json:"type"`
	Value float64 `json:"value"`
}

type AdditionalChargeListForQuote []AdditionalChargeForQuote

func (a AdditionalChargeListForQuote) Value() (driver.Value, error) {
	return json.Marshal(a)
}

func (a *AdditionalChargeListForQuote) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("invalid type for AdditionalChargeList")
	}
	return json.Unmarshal(bytes, a)
}

type QuoteModel struct {
	QuoteID           uuid.UUID                    `gorm:"type:uuid;primary_key" json:"id"`
	Type              string                       `gorm:"type:varchar(255);not null;" json:"type"`
	SalesID           *uuid.UUID                   `gorm:"type:uuid;foreignKey:SalesID" json:"SalesID"`
	Sale              SaleModel                    `gorm:"foreignKey:SalesID;references:SalesID" json:"sale"`
	CustomerID        uuid.UUID                    `gorm:"type:uuid;foreign_Key:CustomerID" json:"customer_id"`
	Customer          CustomerModel                `gorm:"foreignKey:CustomerID;references:CustomerID" json:"customer"`
	User              UserModel                    `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user"`
	CreatedBy         string                       `json:"created_by"`
	QuoteNo           string                       `json:"quote_no"`
	SubTotal          float64                      `json:"subtotal"`
	AdditionalCharges AdditionalChargeListForQuote `gorm:"type:jsonb" json:"additional_charges"`
	Discount          float64                      `json:"discount"`
	Total             float64                      `json:"total"`
	Vat               bool                         `json:"vat"`
	IsCatalog         bool                         `json:"is_catalog"`
	Status            string                       `gorm:"default:Drafted" json:"status"`
	QuoteItems        []QuoteItemModel             `gorm:"foreignKey:QuoteNo;references:QuoteID" json:"quote_items"`
	PoNo              string                       `gorm:"po_no"`
	CreatedAt         time.Time                    `json:"created_at"`
	UpdatedAt         time.Time                    `json:"updated_at"`
}

func (q *QuoteModel) BeforeCreate(_ *gorm.DB) (err error) {
	if q.QuoteID == uuid.Nil {
		q.QuoteID = uuid.New()
	}
	return
}
func (q *QuoteModel) TableName() string {
	return "quotes"
}

func (q *QuoteModel) QuoteModelToDomain() *domain.Quote {
	return QuoteModelToDomain(q)
}

func ConvertAdditionalChargesForQuoteFromDomain(domainCharges []domain.AdditionalChargeForQuote) AdditionalChargeListForQuote {
	var charges AdditionalChargeListForQuote
	for _, c := range domainCharges {
		charges = append(charges, AdditionalChargeForQuote{
			Type:  c.Type,
			Value: c.Value,
		})
	}
	return charges
}

func QuoteModelFromDomain(quote *domain.Quote) *QuoteModel {
	convertedCharges := ConvertAdditionalChargesForQuoteFromDomain(quote.AdditionalCharges)
	var salesIDPtr *uuid.UUID
	if quote.SalesID != uuid.Nil {
		salesIDPtr = &quote.SalesID
	}
	return &QuoteModel{
		QuoteID:           quote.QuoteID,
		Type:              quote.Type,
		CustomerID:        quote.CustomerID,
		CreatedBy:         quote.CreatedBy,
		QuoteNo:           quote.QuoteNo,
		SubTotal:          quote.SubTotal,
		AdditionalCharges: convertedCharges,
		Discount:          quote.Discount,
		Total:             quote.Total,
		Vat:               quote.Vat,
		IsCatalog:         quote.IsCatalog,
		Status:            quote.Status,
		PoNo:              quote.PoNo,
		SalesID:           salesIDPtr,
		CreatedAt:         quote.CreatedAt,
		UpdatedAt:         quote.UpdatedAt,
	}
}
func convertAdditionalChargesForQuoteToDomain(domainCharges []AdditionalChargeForQuote) []domain.AdditionalChargeForQuote {
	var charges []domain.AdditionalChargeForQuote
	for _, c := range domainCharges {
		charges = append(charges, domain.AdditionalChargeForQuote{
			Type:  c.Type,
			Value: c.Value,
		})
	}
	return charges
}

func QuoteModelToDomain(model *QuoteModel) *domain.Quote {
	var items []domain.QuoteItem
	for _, item := range model.QuoteItems {
		items = append(items, *item.QuoteItemModelToDomain())
	}
	var salesID uuid.UUID
	if model.SalesID != nil {
		salesID = *model.SalesID
	}

	return &domain.Quote{
		QuoteID:           model.QuoteID,
		Type:              model.Type,
		CustomerID:        model.CustomerID,
		Customer:          model.Customer.CustomerModelToDomain(),
		User:              model.User.UserModelToDomain(),
		Sale:              model.Sale.SaleFromModelToDomain(),
		SalesID:           salesID,
		CreatedBy:         model.CreatedBy,
		QuoteNo:           model.QuoteNo,
		SubTotal:          model.SubTotal,
		AdditionalCharges: convertAdditionalChargesForQuoteToDomain(model.AdditionalCharges),
		Discount:          model.Discount,
		Total:             model.Total,
		Vat:               model.Vat,
		IsCatalog:         model.IsCatalog,
		Status:            model.Status,
		QuoteItems:        items,
		PoNo:              model.PoNo,
		CreatedAt:         model.CreatedAt,
		UpdatedAt:         model.UpdatedAt,
	}
}
