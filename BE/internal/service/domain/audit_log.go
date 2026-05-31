package domain

import (
	"time"

	"github.com/google/uuid"
)

type AuditLog struct {
	ID          uuid.UUID `json:"id"`
	User        *User
	StatusCode  int       `json:"status_code"`
	Action      string    `json:"action"`
	UserID      string    `json:"user"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}
