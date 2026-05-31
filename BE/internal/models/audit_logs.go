package models

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"

	"gorm.io/gorm"
)

type AuditLog struct {
	ID          uuid.UUID `gorm:"primaryKey;autoIncrement" json:"id"`
	User        UserModel `gorm:"foreignKey:UserID;references:ClerkID" json:"users"`
	StatusCode  int       `json:"status_code"`
	Action      string    `json:"action"`
	UserID      string    `gorm:"forignKey:user_id referance:clerl_id" json:"user"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

func (a *AuditLog) BeforeCreate(_ *gorm.DB) (err error) {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return
}
func (a *AuditLog) TableName() string {
	return "audit_logs"
}
func (a *AuditLog) AuditLogToDomain() *domain.AuditLog {
	return a.AuditLogFromModelToDomain()
}

func AuditLogFromDomain(auditLog *domain.AuditLog) *AuditLog {
	var userModel UserModel
	if auditLog.User != nil {
		userModel = UserModel{
			ID:        auditLog.User.ID,
			FirstName: auditLog.User.FirstName,
			LastName:  auditLog.User.LastName,
			Email:     auditLog.User.Email,
			ClerkID:   auditLog.User.ClerkID,
		}
	}

	return &AuditLog{
		ID:          auditLog.ID,
		User:        userModel,
		StatusCode:  auditLog.StatusCode,
		Action:      auditLog.Action,
		UserID:      auditLog.UserID,
		Description: auditLog.Description,
		CreatedAt:   auditLog.CreatedAt,
	}
}

func (a *AuditLog) AuditLogFromModelToDomain() *domain.AuditLog {
	var domainUser *domain.User
	if a.User.ID != uuid.Nil {
		domainUser = &domain.User{
			ID:        a.User.ID,
			FirstName: a.User.FirstName,
			LastName:  a.User.LastName,
			Email:     a.User.Email,
			PhoneNo:   a.User.PhoneNo,
			ClerkID:   a.User.ClerkID,
		}
	}

	return &domain.AuditLog{
		ID:          a.ID,
		User:        domainUser,
		StatusCode:  a.StatusCode,
		Action:      a.Action,
		UserID:      a.UserID,
		Description: a.Description,
		CreatedAt:   a.CreatedAt,
	}
}
