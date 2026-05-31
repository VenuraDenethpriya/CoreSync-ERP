package models

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserModel struct {
	ID        uuid.UUID       `json:"id" gorm:"type:uuid;primary_key"`
	FirstName string          `json:"first_name"`
	LastName  string          `json:"last_name"`
	ClerkID   string          `json:"clerk_id" gorm:"column:clerk_id"`
	PhoneNo   string          `json:"phone_no"`
	Email     string          `json:"email"`
	Role      domain.UserRole `json:"role"`
	CreatedBy string          `json:"created_by"`
	Creator   *UserModel      `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"creator"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

func (u *UserModel) BeforeCreate(_ *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}
func (u *UserModel) TableName() string {
	return "users"
}
func (u *UserModel) UserModelToDomain() *domain.User {
	return UserModelToDomain(u)
}
func UserModelFromDomain(user *domain.User) *UserModel {
	return &UserModel{
		ID:        user.ID,
		ClerkID:   user.ClerkID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		PhoneNo:   user.PhoneNo,
		Email:     user.Email,
		Role:      user.Role,
		CreatedBy: user.CreatedBy,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}
func UserModelToDomain(model *UserModel) *domain.User {
	var creatorName string
	if model.Creator != nil {
		creatorName = model.Creator.FirstName + " " + model.Creator.LastName
	} else {
		creatorName = model.CreatedBy
	}
	return &domain.User{
		ID:        model.ID,
		ClerkID:   model.ClerkID,
		FirstName: model.FirstName,
		LastName:  model.LastName,
		PhoneNo:   model.PhoneNo,
		Email:     model.Email,
		Role:      model.Role,
		CreatedBy: creatorName,
		CreatedAt: model.CreatedAt,
		UpdatedAt: model.UpdatedAt,
	}
}
