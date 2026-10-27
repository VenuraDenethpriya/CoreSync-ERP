package domain

import (
	"time"

	"github.com/google/uuid"
)

type SalesTarget struct {
	ID            uuid.UUID
	User          *User
	Salesperson   *Salesperson
	SalespersonID uuid.UUID
	TargetAmount  float64
	Sale          float64
	Commission    float64
	Month         int
	Year          int
	CreatedBy     string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}
