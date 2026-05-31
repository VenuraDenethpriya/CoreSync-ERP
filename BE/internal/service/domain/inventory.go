package domain

import (
	"time"

	"github.com/google/uuid"
)

type Inventory struct {
	ID uuid.UUID `json:"id"`
	// User *User
	User                  *User     `gorm:"foreignKey:CreatedBy"`
	ItemCode              string    `json:"item_code"`
	ItemName              string    `json:"item_name"`
	QuantityInStock       int       `json:"quantity_in_stock"`
	Hold                  float64   `json:"hold"`
	UnitCost              float64   `json:"unit_cost"`
	Threshold             float64   `json:"threshold"`
	Status                string    `json:"status"`
	ProductID             uuid.UUID `json:"product_id"`
	InventoryItemAllocate *InventoryItemAllocate
	Allocated             int       `json:"allocated"`
	CreatedBy             string    `json:"created_by"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}

type InventoryItemUsage struct {
	ID uuid.UUID `json:"id"`
	// User          *User
	User          *User     `gorm:"foreignKey:UserName"`
	InventoryID   uuid.UUID `json:"inventory_id"`
	InventoryCode string    `json:"inventory_code"`
	InventoryName string    `json:"inventory_name"`
	ItemID        uuid.UUID `json:"item_id"`
	// ItemID    uuid.UUID `json:"item_id"`
	ItemCode string `json:"item_code"`
	// ItemName  string    `json:"item_name"`
	OrderID   uuid.UUID `json:"order_id"`
	OrderType string    `json:"order_type"`
	OrederNo  string    `json:"order_no"`
	// OldUsageCount int       `json:"old_usage_count"`
	// NewUsageCount int       `json:"new_usage_count"`
	// UsageCount    int    `json:"usage_count"`
	UserName      string `json:"user_name"`
	InventoryItem *InventoryItem
	CreatedAt     time.Time `json:"created_at"`
}

type InventoryItemRestock struct {
	ID uuid.UUID `json:"id"`
	// User      *User
	User      *User     `gorm:"foreignKey:UserName"`
	ItemID    uuid.UUID `json:"item_id"`
	ItemCode  string    `json:"item_code"`
	UnitPrice float64   `json:"unit_price"`
	Quantity  int       `json:"quantity"`
	Amount    float64   `json:"amount"`
	UserName  string    `json:"user_name"`
	Remark    string    `json:"remark"`
	IsPrint   bool      `json:"is_print"`
	CreatedAt time.Time `json:"created_at"`
	Items     []InventoryItem
}
type InventoryItemAllocate struct {
	ID uuid.UUID `json:"id"`
	// User      *User
	User      *User     `gorm:"foreignKey:Allocator"`
	ItemID    uuid.UUID `json:"item_id"`
	ItemCode  string    `json:"item_code"`
	ItemName  string    `json:"item_name"`
	OrderID   uuid.UUID `json:"order_id"`
	OrderType string    `json:"order_type"`
	OrderNo   string    `json:"order_no"`
	OldCount  int       `json:"old_count"`
	Count     int       `json:"count"`
	Allocator string    `json:"user_name"`
	CreatedAt time.Time `json:"created_at"`
}

type InventoryItem struct {
	ID        uuid.UUID  `json:"id"`
	ItemID    uuid.UUID  `json:"item_id"`
	RestockID uuid.UUID  `json:"restock_id"`
	ItemCode  string     `json:"item_code"`
	Inventory *Inventory `json:"inventory"`
}
