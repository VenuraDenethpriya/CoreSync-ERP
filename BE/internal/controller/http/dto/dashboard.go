package dto

import "github.com/google/uuid"

type LowStockInventory struct {
	ItemID   uuid.UUID
	ItemCode string
	ItemName string
	Quantity float64
	Status   string
}
type DashboardData struct {
	LastMonthSales              float64
	LastMonthOrdersCount        int64
	CurrentMonthSales           float64
	SalesGrowthPercentage       float64
	DeleverdOrdersCount         int64
	DeliveredOrderGrowthPercent float64
	CompletedOrdersCount        int64
	PendingOrdersCount          int64
	BalancingOrdersCount        int64
	BatteryPackCount            int64
	SolarCount                  int64
	EBikeCount                  int64
	ServiceCount                int64
	OtherCount                  int64
	DraftedQuotesCount          int64
	RejectedQuotesCount         int64
	SubmittedQuotesCount        int64
	ConfirmedQuotesCount        int64
	LowStockInventory           []LowStockInventory
}
