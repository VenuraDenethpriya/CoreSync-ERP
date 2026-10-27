package domain

import (
	"time"

	"github.com/google/uuid"
)

type Sale struct {
	SalesID         uuid.UUID    `json:"SalesID"`
	SalesNo         string       `json:"sales_no"`
	User            *User        `json:"user"`
	Order           *Order       `json:"order"`
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

type DateRange struct {
	StartDate time.Time
	EndDate   time.Time
}

type MonthlySalespersonPerformance struct {
	SalespersonName string  `gorm:"column:salesperson_name"`
	Target          float64 `gorm:"column:target"`
	Sales           float64 `gorm:"column:sales"`
}

type YearlySalespersonPerformance struct {
	MonthName       string  `gorm:"column:month_name"`
	SalespersonName string  `gorm:"column:salesperson_name"`
	Target          float64 `gorm:"column:target"`
	Sales           float64 `gorm:"column:sales"`
}

type SalesDashboard struct {
	LastMonthDate DateRange
	LastMonthData []MonthlySalespersonPerformance
	LastYearDate  DateRange
	LastYearData  []YearlySalespersonPerformance
}
type SalespersonThisMonth struct {
	Target float64 `gorm:"column:target"`
	Sales  float64 `gorm:"column:sales"`
}

type SalespersonMonthlySale struct {
	MonthName string  `gorm:"column:month_name"`
	TotalSale float64 `gorm:"column:total_sale"`
}

type SingleSalespersonDashboard struct {
	ThisMonthDate DateRange
	ThisMonthData []SalespersonThisMonth
	LastYearDate  DateRange
	LastYearData  []SalespersonMonthlySale
}
