package domain

import (
	"time"

	"github.com/google/uuid"
)

type Salesperson struct {
	ID        uuid.UUID `json:"id"`
	User      *User
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	PhoneNo   string    `json:"phone_no"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
