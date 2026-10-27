package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"CoreSync-backend/internal/service/domain"
)

type SalesTargetModel struct {
	ID            uuid.UUID        `json:"id" gorm:"type:uuid;primary_key"`
	SalespersonID uuid.UUID        `json:"salesperson_id" gorm:"type:uuid"`
	Salesperson   SalespersonModel `gorm:"foreignKey:SalespersonID;references:ID" json:"salesperson"`
	User          UserModel        `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user"`
	TargetAmount  float64          `json:"target_amount"`
	Month         int              `json:"month"`
	Year          int              `json:"year"`
	CreatedBy     string           `json:"created_by"`
	CreatedAt     time.Time        `json:"created_at"`
	UpdatedAt     time.Time        `json:"updated_at"`
}

func (s *SalesTargetModel) BeforeCreate(_ *gorm.DB) (err error) {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return
}

func (s *SalesTargetModel) TableName() string {
	return "sales_targets"
}

func (s *SalesTargetModel) SalesTargetToDomain() *domain.SalesTarget {
	return s.SalesTargetFromModelToDomain()
}

func SalesTargetFromDomain(salesTarget *domain.SalesTarget) *SalesTargetModel {
	return &SalesTargetModel{
		SalespersonID: salesTarget.SalespersonID,
		TargetAmount:  salesTarget.TargetAmount,
		Month:         salesTarget.Month,
		Year:          salesTarget.Year,
		CreatedBy:     salesTarget.CreatedBy,
		CreatedAt:     salesTarget.CreatedAt,
		UpdatedAt:     salesTarget.UpdatedAt,
	}
}

func (s *SalesTargetModel) SalesTargetFromModelToDomain() *domain.SalesTarget {
	return &domain.SalesTarget{
		ID:           s.ID,
		User:         s.User.UserModelToDomain(),
		Salesperson:  s.Salesperson.SalespersonToDomain(),
		TargetAmount: s.TargetAmount,
		Month:        s.Month,
		Year:         s.Year,
		CreatedBy:    s.CreatedBy,
		CreatedAt:    s.CreatedAt,
		UpdatedAt:    s.UpdatedAt,
	}
}
