package domain

import (
	"time"

	"github.com/google/uuid"
)

type Bom struct {
	ID          uuid.UUID  `json:"id"`
	ProductID   uuid.UUID  `json:"product_id"`
	InventoryID uuid.UUID  `json:"inventory_id"`
	Product     *Product   `json:"product" `
	Inventory   *Inventory `json:"inventory"`
	Quantity    int        `json:"quantity"`
	User        *User      `json:"user"`
	CreatedBy   string     `json:"created_by"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
