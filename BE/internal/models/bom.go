package models

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BomModel struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	ProductID   uuid.UUID      `json:"product_id" gorm:"type:uuid"`
	InventoryID uuid.UUID      `json:"inventory_id" gorm:"type:uuid"`
	Inventory   InventoryModel `json:"inventory" gorm:"foreignKey:InventoryID;references:ID"`
	Product     ProductModel   `json:"product" gorm:"foreignKey:ProductID;references:ProductID"`
	Quantity    int            `json:"quantity"`
	User        UserModel      `json:"user" gorm:"foreignKey:CreatedBy;references:ClerkID"`
	CreatedBy   string         `json:"created_by"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

func (b *BomModel) BeforeCreate(_ *gorm.DB) (err error) {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return
}
func (b *BomModel) TableName() string {
	return "boms"
}

func (b *BomModel) BomModelToDomain() *domain.Bom {
	return BomModelToDomain(b)
}
func BomModelFromDomain(b *domain.Bom) *BomModel {
	return &BomModel{
		ID:          b.ID,
		ProductID:   b.ProductID,
		InventoryID: b.InventoryID,
		Quantity:    b.Quantity,
		CreatedBy:   b.CreatedBy,
	}
}

func BomModelToDomain(b *BomModel) *domain.Bom {
	return &domain.Bom{
		ID:          b.ID,
		ProductID:   b.ProductID,
		InventoryID: b.InventoryID,
		Quantity:    b.Quantity,
		User:        b.User.UserModelToDomain(),
		Inventory:   b.Inventory.InventoryModelToDomain(),
		Product:     b.Product.ProductModelToDomain(),
		CreatedBy:   b.CreatedBy,
		CreatedAt:   b.CreatedAt,
		UpdatedAt:   b.UpdatedAt,
	}
}
