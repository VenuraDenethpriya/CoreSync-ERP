package domain

import (
	"time"

	"github.com/google/uuid"
)

type ProductCategory string

const (
	ProductCategoryBatteryPack ProductCategory = "BATTERY_PACK"
	ProductCategorySolar       ProductCategory = "SOLAR"
	ProductCategoryEVehicle    ProductCategory = "E_VEHICLE"
	ProductCategoryService     ProductCategory = "SERVICE"
	ProductCategoryOther       ProductCategory = "OTHER"
)

type BatteryPackType string

type Product struct {
	ProductID      uuid.UUID       `json:"id"`
	Category       ProductCategory `json:"category"`
	Name           string          `json:"name"`
	Type           string          `json:"type,omitempty"`
	CellCount      string          `json:"cell_count,omitempty"`
	CellType       string          `json:"cell_type,omitempty"`
	Voltage        float64         `json:"voltage,omitempty"`
	Capacity       float64         `json:"capacity,omitempty"`
	BmsType        string          `json:"bms_type,omitempty"`
	Monitor        string          `json:"monitor,omitempty"`
	BasePrice      float64         `json:"base_price"`
	Specifications string          `json:"Specifications,omitempty"`
	SolarPanel     string          `json:"PanelType,omitempty"`
	Inverter       string          `json:"Inverter,omitempty"`
	IsActive       *bool           `json:"is_active"`
	User           *User
	CreatedBy      string    `json:"created_by"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
