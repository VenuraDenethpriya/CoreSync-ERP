package models

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type WireHarnessModel struct {
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

func (c *WireHarnessModel) BeforeCreate(_ *gorm.DB) (err error) {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return
}

func (c *WireHarnessModel) TableName() string {
	return "wire_harness"
}

func WireHarnessFromDomain(c *domain.WireHarness) *WireHarnessModel {
	return &WireHarnessModel{
		ID:        c.ID,
		SerialNo:  c.SerialNo,
		ProductID: c.ProductID,
		CreatedBy: c.CreatedBy,
		Note:      c.Note,
	}
}

func WireHarnessModelToDomain(c *WireHarnessModel) *domain.WireHarness {
	return &domain.WireHarness{
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

func WireHarnessModelsFromDomainSlice(domains []*domain.WireHarness) []*WireHarnessModel {
	var models []*WireHarnessModel
	for _, d := range domains {
		models = append(models, WireHarnessFromDomain(d))
	}
	return models
}

func WireHarnessModelsToDomainSlice(models []*WireHarnessModel) []*domain.WireHarness {
	var domains []*domain.WireHarness
	for _, m := range models {
		domains = append(domains, WireHarnessModelToDomain(m))
	}
	return domains
}
