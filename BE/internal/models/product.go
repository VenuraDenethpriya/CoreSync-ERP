package models

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"

	"gorm.io/gorm"
)

type ProductModel struct {
	ProductID      uuid.UUID              `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Category       domain.ProductCategory `gorm:"type:product_category;not null;default:'BATTERY_PACK'" json:"category"`
	Name           string                 `gorm:"type:varchar(100);not null" json:"ProductName"`
	Type           string                 `gorm:"type:varchar(100)" json:"Type,omitempty"`
	CellCount      string                 `gorm:"type:varchar(100)" json:"CellCount ,omitempty"`
	CellType       string                 `gorm:"type:varchar(100)" json:"CellType,omitempty"`
	Voltage        float64                `gorm:"type:float" json:"Voltage,omitempty"`
	Capacity       float64                `gorm:"type:float" json:"Capacity,omitempty"`
	BmsType        string                 `gorm:"type:varchar(100)" json:"BmsType,omitempty"`
	Monitor        string                 `gorm:"type:varchar(100)" json:"Monitor,omitempty"`
	BasePrice      float64                `gorm:"type:decimal(10,2);not null" json:"BasePrice"`
	Specifications string                 `gorm:"type:varchar(255)" json:"Specifications,omitempty"`
	IsActive       *bool                  `gorm:"default:true" json:"is_active"`
	SolarPanel     string                 `gorm:"type:varchar(100)" json:"PanelType,omitempty"`
	Inverter       string                 `gorm:"type:varchar(100)" json:"Inverter,omitempty"`
	CreatedBy      string                 `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"created_by"`
	User           UserModel              `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user"`
	CreatedAt      time.Time              `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time              `gorm:"autoUpdateTime" json:"updated_at"`
}

func (p *ProductModel) BeforeCreate(_ *gorm.DB) (err error) {
	if p.ProductID == uuid.Nil {
		p.ProductID = uuid.New()
	}
	return
}

func (p *ProductModel) TableName() string {
	return "products"
}

func (p *ProductModel) ProductModelToDomain() *domain.Product {
	return ProductModelToDomain(p)
}

func ProductModelFromDomain(product *domain.Product) *ProductModel {
	if product == nil {
		return nil
	}

	productModel := &ProductModel{
		ProductID:      product.ProductID,
		Category:       product.Category,
		Name:           product.Name,
		Type:           product.Type,
		CellCount:      product.CellCount,
		CellType:       product.CellType,
		Voltage:        product.Voltage,
		Capacity:       product.Capacity,
		BmsType:        product.BmsType,
		Monitor:        product.Monitor,
		BasePrice:      product.BasePrice,
		Specifications: product.Specifications,
		SolarPanel:     product.SolarPanel,
		Inverter:       product.Inverter,
		CreatedBy:      product.CreatedBy,
	}

	if product.IsActive != nil {
		productModel.IsActive = product.IsActive
	}

	return productModel
}

func ProductModelToDomain(model *ProductModel) *domain.Product {
	return &domain.Product{
		ProductID:      model.ProductID,
		Category:       model.Category,
		Name:           model.Name,
		Type:           model.Type,
		CellCount:      model.CellCount,
		CellType:       model.CellType,
		Voltage:        model.Voltage,
		Capacity:       model.Capacity,
		BmsType:        model.BmsType,
		Monitor:        model.Monitor,
		BasePrice:      model.BasePrice,
		Specifications: model.Specifications,
		IsActive:       model.IsActive,
		SolarPanel:     model.SolarPanel,
		Inverter:       model.Inverter,
		User:           model.User.UserModelToDomain(),
		CreatedBy:      model.CreatedBy,
		CreatedAt:      model.CreatedAt,
		UpdatedAt:      model.UpdatedAt,
	}
}
