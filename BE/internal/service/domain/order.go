package domain

import (
	"time"

	"github.com/google/uuid"
)

type AdditionalCharge struct {
	Type  string  `json:"type"`
	Value float64 `json:"value"`
}
type CADFile struct {
	FileName []string `json:"file_name"`
	Email    []string `json:"email"`
	Quantity int      `json:"quantity"`
}
type Designer struct {
	Email       []string `json:"email"`
	Description string   `json:"description"`
}
type OrderItemSummary struct {
	ProductID   uuid.UUID `json:"product_id"`
	ProductName string    `json:"-"`
	UnitPrice   float64   `json:"unit_price"`
	Quantity    int       `json:"quantity"`
	Note        string    `json:"note"`
}

type Order struct {
	OrderID           uuid.UUID `json:"id"`
	Type              string    `json:"type"`
	CustomerID        uuid.UUID `gorm:"foreignKey:CustomerID" json:"customer_id"`
	SalesID           uuid.UUID `gorm:"foreignKey:SalesID" json:"SalesID"`
	Customer          *Customer
	User              *User
	Sale              *Sale
	CreatedBy         string             `json:"created_by"`
	OrderNo           string             `json:"order_no"`
	SubTotal          float64            `json:"subtotal"`
	AdditionalCharges []AdditionalCharge `json:"additional_charges"`
	Discount          float64            `json:"discount"`
	Total             float64            `json:"total"`
	Vat               bool               `json:"vat"`
	// Items                *[]uuid.UUID       `json:"items"`
	Items                []OrderItemSummary `json:"items"`
	OrderStatus          string             `json:"OrderStatus"`
	PaymentStatus        string             `json:"PaymentStatus"`
	ExpectedDeliveryDate time.Time          `json:"expected_delivery_date,omitempty"`
	OrderItems           []OrderItem        `json:"order_items"`
	Payments             []Payment          `json:"payments"`
	Assignee             []string           `json:"assignee,omitempty"`
	Supervisor           string             `json:"supervisor,omitempty"`
	CADFiles             CADFile            `json:"cad_files,omitempty"`
	Designer             Designer           `json:"designer,omitempty"`
	PoNo                 string             `json:"po_no"`
	QcProof              string             `json:"QcProof"`
	DeliveryProof        string             `json:"DeliveryProof"`
	CreatedAt            time.Time          `json:"created_at"`
	UpdatedAt            time.Time          `json:"updated_at"`
}

type OrderItem struct {
	ID            uuid.UUID    `json:"id"`
	Order         *Order       `json:"order,omitempty"`
	OrderNo       *uuid.UUID   `gorm:"foreignKey:OrderNo" json:"order_no"`
	ProductID     uuid.UUID    `gorm:"foreignKey:ProductID" json:"product_id"`
	ProductName   *Product     `gorm:"foreignKey:ProductID" json:"product_name"`
	CasingID      *uuid.UUID   `json:"casing_id"`
	Casing        *Casing      `json:"casing"`
	WireHarnessID *uuid.UUID   `json:"wire_harness_id"`
	WireHarness   *WireHarness `json:"wire_harness"`
	Quantity      int          `json:"quantity"`
	UnitPrice     float64      `json:"unit_price"`
	// SubTotal    float64   `json:"subtotal"`
	Note            string    `json:"note"`
	SerialNo        string    `json:"serial_no"`
	Priority        string    `json:"priority"`
	Status          string    `json:"status"`
	ExistingOrderID uuid.UUID `json:"existingorderid"`
	NewOrderID      uuid.UUID `json:"neworderid"`
	CreatedAt       time.Time `json:"created_at"`
}
