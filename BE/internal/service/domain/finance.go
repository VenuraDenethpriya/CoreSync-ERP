package domain

import (
	"time"

	"github.com/google/uuid"
)

type Item struct {
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	Quantity      int     `json:"quantity"`
	EstimatedCost float64 `json:"estimated_cost"`
	Supplier      string  `json:"supplier"`
	Reason        string  `json:"reason"`
}

type Finance struct {
	ID            uuid.UUID `json:"id"`
	User          *User     `json:"user"`
	Creator       *User     `json:"creator"`
	Updater       *User     `json:"updater"`
	PurchaseNo    string    `json:"purchase_no"`
	Department    string    `json:"department"`
	Date          string    `json:"date"`
	Status        string    `json:"status"`
	Remark        string    `json:"remark"`
	RequestedBy   string    `json:"requested_by"`
	Items         []Item    `json:"items"`
	IsTransferred bool      `json:"is_transferred"`
	UpdatedBy     string    `json:"updated_by"`
	CreatedAt     time.Time `json:"created_at"`
	CreatedBy     string    `json:"created_by"`
	UpdatedAt     time.Time `json:"updated_at"`
}
