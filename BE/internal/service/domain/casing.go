package domain

import (
	"time"

	"github.com/google/uuid"
)

type Casing struct {
	ID        uuid.UUID `json:"id"`
	SerialNo  string    `json:"serial_number"`
	Product   *Product  `json:"product"`
	ProductID uuid.UUID `json:"product_id"`
	User      *User     `json:"user"`
	CreatedBy string    `json:"created_by"`
	Note      string    `json:"note"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
