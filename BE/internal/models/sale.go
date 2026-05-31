package models

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SaleModel struct {
	SalesID         uuid.UUID        `json:"SalesID" gorm:"type:uuid;primary_key"`
	SalesNo         string           `json:"sales_no"`
	User            *UserModel       `gorm:"foreignKey:UpdatedBy;references:ClerkID" json:"user"`
	Salesperson     uuid.UUID        `json:"salesperson" gorm:"type:uuid"`
	SalespersonData SalespersonModel `gorm:"foreignKey:Salesperson;references:ID" json:"salesperson_data"`
	SalesType       string           `json:"type"`
	Status          string           `json:"status"`
	Commission      *float64         `json:"commission"`
	Date            time.Time        `json:"date"`
	CustomerName    string           `json:"customer_name"`
	CustomerPhone   string           `json:"customer_phone"`
	Description     string           `json:"description"`
	RecordingURL    string           `json:"recording_url"`
	UpdatedBy       string           `json:"updated_by"`
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`
}

func (s *SaleModel) BeforeCreate(_ *gorm.DB) (err error) {
	if s.SalesID == uuid.Nil {
		s.SalesID = uuid.New()
	}
	return
}

func (s *SaleModel) TableName() string {
	return "sales"
}

func (s *SaleModel) SaleToDomain() *domain.Sale {
	return s.SaleFromModelToDomain()
}
func SaleFromDomain(sale *domain.Sale) *SaleModel {
	return &SaleModel{
		SalesID:       sale.SalesID,
		Salesperson:   sale.Salesperson,
		SalesType:     sale.SalesType,
		Status:        sale.Status,
		Commission:    sale.Commission,
		Date:          sale.Date,
		CustomerName:  sale.CustomerName,
		CustomerPhone: sale.CustomerPhone,
		Description:   sale.Description,
		RecordingURL:  sale.RecordingURL,
		UpdatedBy:     sale.UpdatedBy,
		CreatedAt:     sale.CreatedAt,
		UpdatedAt:     sale.UpdatedAt,
	}
}

func (s *SaleModel) SaleFromModelToDomain() *domain.Sale {
	var userDomain *domain.User
	if s.User != nil {
		userDomain = s.User.UserModelToDomain()
	}
	domainSale := &domain.Sale{
		SalesID:       s.SalesID,
		SalesNo:       s.SalesNo,
		User:          userDomain,
		Salesperson:   s.Salesperson,
		SalesType:     s.SalesType,
		Status:        s.Status,
		Commission:    s.Commission,
		Date:          s.Date,
		CustomerName:  s.CustomerName,
		CustomerPhone: s.CustomerPhone,
		Description:   s.Description,
		RecordingURL:  s.RecordingURL,
		UpdatedBy:     s.UpdatedBy,
		CreatedAt:     s.CreatedAt,
		UpdatedAt:     s.UpdatedAt,
	}

	if s.SalespersonData.ID != uuid.Nil {
		domainSale.SalespersonData = s.SalespersonData.SalespersonFromModelToDomain()
	}

	if s.User != nil {
		domainSale.User = s.User.UserModelToDomain()
	}

	return domainSale
}
