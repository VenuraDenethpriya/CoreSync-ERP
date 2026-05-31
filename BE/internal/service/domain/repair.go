package domain

import (
	"time"

	"github.com/google/uuid"
)

type Repair struct {
	ID            uuid.UUID `json:"repair_id"`
	User          *User     `json:"user"`
	Order         *Order    `json:"order"`
	JobNo         string    `json:"job_no"`
	OrderId       uuid.UUID `json:"order_id"`
	Description   string    `json:"description"`
	Status        string    `json:"status"`
	DueDate       time.Time `json:"due_date"`
	Price         float64   `json:"price"`
	CustomerName  string    `json:"customer_name"`
	CustomerPhone string    `json:"customer_phone"`
	CreatedBy     string    `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
type RepairItemUsage struct {
	ID            uuid.UUID `json:"id"`
	User          *User
	InventoryID   uuid.UUID `json:"inventory_id"`
	InventoryCode string    `json:"inventory_code"`
	InventoryName string    `json:"inventory_name"`
	ItemID        uuid.UUID `json:"item_id"`
	// ItemID    uuid.UUID `json:"item_id"`
	ItemCode string `json:"item_code"`
	// ItemName  string    `json:"item_name"`
	RepairID uuid.UUID `json:"repair_id"`
	JobNo    string    `json:"job_no"`
	// OldUsageCount int       `json:"old_usage_count"`
	// NewUsageCount int       `json:"new_usage_count"`
	// UsageCount    int    `json:"usage_count"`
	UserName      string `json:"user_name"`
	InventoryItem *InventoryItem
	CreatedAt     time.Time `json:"created_at"`
}
