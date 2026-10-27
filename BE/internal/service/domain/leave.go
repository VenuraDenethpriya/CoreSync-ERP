package domain

import (
	"time"

	"github.com/google/uuid"
)

type Leave struct {
	ID         uuid.UUID   `json:"id"`
	User       *User       `json:"user"`
	Accept     *User       `json:"accept"`
	Employee   *Employee   `json:"employee"`
	EmployeeId uuid.UUID   `json:"employee_id"`
	Type       string      `json:"type"`
	Year       string      `json:"year"`
	Date       []time.Time `json:"date"`
	Reason     string      `json:"reason"`
	Proof      string      `json:"proof"`
	Status     string      `json:"status"`
	AcceptedBy string      `json:"accepted_by"`
	Comment    string      `json:"comment"`
	CreatedBy  string      `json:"created_by"`
	CreatedAt  time.Time   `json:"created_at"`
	UpdatedAt  time.Time   `json:"updated_at"`
}
