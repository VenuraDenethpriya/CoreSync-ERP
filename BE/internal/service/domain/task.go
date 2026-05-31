package domain

import (
	"time"

	"github.com/google/uuid"
)

type Task struct {
	ID             uuid.UUID `json:"id"`
	OrderItems     []*OrderItem
	User           *User
	OrderNo        string
	OrderType      string
	OrderId        uuid.UUID `json:"order_id"`
	JobId          uuid.UUID `json:"job_id"`
	JobNo          string    `json:"job_no"`
	Task           string    `json:"task"`
	Date           time.Time `json:"date"`
	Time           string    `json:"time"`
	Status         string    `json:"status"`
	Assignee       string    `json:"assignee"`
	Supervisor     string    `json:"supervisor"`
	AssigneeUser   *User
	SupervisorUser *User
	Description    string    `json:"description"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
