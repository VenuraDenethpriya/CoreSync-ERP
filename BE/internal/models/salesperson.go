package models

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SalespersonModel struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key"`
	User      UserModel `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	PhoneNo   string    `json:"phone_no"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (s *SalespersonModel) BeforeCreate(_ *gorm.DB) (err error) {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return
}

func (s *SalespersonModel) TableName() string {
	return "salespersons"
}

func (s *SalespersonModel) SalespersonToDomain() *domain.Salesperson {
	return s.SalespersonFromModelToDomain()
}

func SalespersonFromDomain(salesperson *domain.Salesperson) *SalespersonModel {
	return &SalespersonModel{
		ID:        salesperson.ID,
		FirstName: salesperson.FirstName,
		LastName:  salesperson.LastName,
		Email:     salesperson.Email,
		PhoneNo:   salesperson.PhoneNo,
		CreatedBy: salesperson.CreatedBy,
		CreatedAt: salesperson.CreatedAt,
		UpdatedAt: salesperson.UpdatedAt,
	}
}

func (s *SalespersonModel) SalespersonFromModelToDomain() *domain.Salesperson {
	return &domain.Salesperson{
		ID:        s.ID,
		User:      s.User.UserModelToDomain(),
		FirstName: s.FirstName,
		LastName:  s.LastName,
		Email:     s.Email,
		PhoneNo:   s.PhoneNo,
		CreatedBy: s.CreatedBy,
		CreatedAt: s.CreatedAt,
		UpdatedAt: s.UpdatedAt,
	}
}
