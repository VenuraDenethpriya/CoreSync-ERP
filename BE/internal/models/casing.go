package models

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CasingModel struct {
	ID        uuid.UUID    `json:"id" gorm:"primaryKey"`
	SerialNo  string       `json:"serial_no"`
	Product   ProductModel `json:"product" gorm:"foreignKey:ProductID;references:ProductID"`
	ProductID uuid.UUID    `json:"product_id" gorm:"type:uuid"`
	User      UserModel    `json:"user" gorm:"foreignKey:CreatedBy;references:ClerkID"`
	CreatedBy string       `json:"created_by"`
	Note      string       `json:"note"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}

func (c *CasingModel) BeforeCreate(_ *gorm.DB) (err error) {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return
}

func (c *CasingModel) TableName() string {
	return "casings"
}

func CasingModelFromDomain(c *domain.Casing) *CasingModel {
	return &CasingModel{
		ID:        c.ID,
		SerialNo:  c.SerialNo,
		ProductID: c.ProductID,
		CreatedBy: c.CreatedBy,
		Note:      c.Note,
	}
}

func CasingModelToDomain(c *CasingModel) *domain.Casing {
	return &domain.Casing{
		ID:        c.ID,
		SerialNo:  c.SerialNo,
		ProductID: c.ProductID,
		User:      c.User.UserModelToDomain(),
		Product:   c.Product.ProductModelToDomain(),
		CreatedBy: c.CreatedBy,
		Note:      c.Note,
		CreatedAt: c.CreatedAt,
		UpdatedAt: c.UpdatedAt,
	}
}

func CasingModelsFromDomainSlice(domains []*domain.Casing) []*CasingModel {
	var models []*CasingModel
	for _, d := range domains {
		models = append(models, CasingModelFromDomain(d))
	}
	return models
}

func CasingModelsToDomainSlice(models []*CasingModel) []*domain.Casing {
	var domains []*domain.Casing
	for _, m := range models {
		domains = append(domains, CasingModelToDomain(m))
	}
	return domains
}
