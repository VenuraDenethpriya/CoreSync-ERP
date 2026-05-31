package models

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type QuoteItemModel struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	QuoteNo   uuid.UUID `gorm:"type:uuid;foreignKey:QuoteNo" json:"quote_no"`
	ProductID uuid.UUID `gorm:"type:uuid" json:"product_id"`
	Product   *ProductModel
	Name      ProductModel `gorm:"foreignKey:ProductID;references:ProductID" json:"product_name"`
	Quantity  int          `json:"quantity"`
	UnitPrice float64      `json:"unit_price"`
	SubTotal  float64      `json:"subtotal"`
	Note      string       `json:"note"`
	CreatedAt time.Time    `json:"created_at"`
}

func (q *QuoteItemModel) BeforeCreate(_ *gorm.DB) (err error) {
	if q.ID == uuid.Nil {
		q.ID = uuid.New()
	}
	return
}
func (q *QuoteItemModel) TableName() string {
	return "quote_items"
}

func (q *QuoteItemModel) QuoteItemModelToDomain() *domain.QuoteItem {
	return QuoteItemModelToDomain(q)
}

func QuoteItemModelFromDomain(quoteItem *domain.QuoteItem) *QuoteItemModel {
	if quoteItem == nil {
		return nil
	}

	productModel := ProductModelFromDomain(quoteItem.ProductName)

	return &QuoteItemModel{
		ID:        quoteItem.ID,
		QuoteNo:   quoteItem.QuoteNo,
		ProductID: quoteItem.ProductID,
		Product:   productModel,
		Quantity:  quoteItem.Quantity,
		UnitPrice: quoteItem.UnitPrice,
		SubTotal:  quoteItem.SubTotal,
		Note:      quoteItem.Note,
	}
}

func QuoteItemModelToDomain(model *QuoteItemModel) *domain.QuoteItem {
	return &domain.QuoteItem{
		ID:          model.ID,
		QuoteNo:     model.QuoteNo,
		ProductID:   model.ProductID,
		ProductName: model.Name.ProductModelToDomain(),
		Quantity:    model.Quantity,
		UnitPrice:   model.UnitPrice,
		SubTotal:    model.SubTotal,
		Note:        model.Note,
		CreatedAt:   model.CreatedAt,
	}
}
