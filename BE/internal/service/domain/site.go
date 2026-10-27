package domain

import (
	"time"

	"github.com/google/uuid"
)

type Site struct {
	ID          uuid.UUID `json:"id"`
	OrderID     uuid.UUID `json:"order_id"`
	Order       *Order    `json:"order"`
	Location    string    `json:"location,omitempty"`
	Assignee    []string  `jsonn:"assignee,omitempty"`
	Date        time.Time `json:"date"`
	StartTime   string    `json:"start_time"`
	EndTime     string    `json:"end_time"`
	Capacity    float64   `json:"capacity,omitempty"`
	SolarType   string    `json:"solar_type,omitempty"`
	PanelType   string    `json:"panel_type,omitempty"`
	Inverter    string    `json:"inverter,omitempty"`
	Status      string    `json:"status,omitempty"`
	Description string    `json:"description,omitempty"`
	CreatedBy   string    `json:"created_by"`
	User        *User     `json:"user"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
