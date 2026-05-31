package domain

import (
	"time"

	"github.com/google/uuid"
)

type Sale struct {
	SalesID         uuid.UUID    `json:"SalesID"`
	SalesNo         string       `json:"sales_no"`
	User            *User        `json:"user"`
	Salesperson     uuid.UUID    `json:"salesperson"`
	SalespersonData *Salesperson `json:"salesperson_data"`
	SalesType       string       `json:"type"`
	Status          string       `json:"status"`
	Commission      *float64     `json:"commission"`
	Date            time.Time    `json:"date"`
	CustomerName    string       `json:"customer_name"`
	CustomerPhone   string       `json:"customer_phone"`
	Description     string       `json:"description"`
	RecordingURL    string       `json:"recording_url"`
	UpdatedBy       string       `json:"updated_by"`
	CreatedAt       time.Time    `json:"created_at"`
	UpdatedAt       time.Time    `json:"updated_at"`
}
