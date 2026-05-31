package repository

import (
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

type DashboardRepository struct {
	db *gorm.DB
}

func NewDashboardRepository(db *gorm.DB) *DashboardRepository {
	return &DashboardRepository{
		db,
	}
}
func getMonthRange(year int, month time.Month) (time.Time, time.Time) {
	start := time.Date(year, month, 1, 0, 0, 0, 0, time.Local)
	end := start.AddDate(0, 1, 0).Add(-time.Second)
	return start, end
}

func (dr *DashboardRepository) GetDashboardData() (*dto.DashboardData, error) {

	now := time.Now()

	// Get current and last month date ranges
	currentStart, currentEnd := getMonthRange(now.Year(), now.Month())
	lastMonth := now.AddDate(0, -1, 0)
	lastStart, lastEnd := getMonthRange(lastMonth.Year(), lastMonth.Month())

	var currentSales, lastSales float64
	var lastMonthSalesCount int64
	var currentDeliveredCount, lastDeliveredCount int64

	// Total sales current month
	// err := dr.db.Model(&models.OrderModel{}).
	// 	Where("created_at BETWEEN ? AND ?", currentStart, currentEnd).
	// 	Select("COALESCE(SUM(total), 0)").Scan(&currentSales).Error
	// if err != nil {
	// 	return nil, err
	// }
	err := dr.db.Model(&models.OrderModel{}).
		Where("created_at BETWEEN ? AND ?", currentStart, currentEnd).
		Where("order_status <> ?", "Cancelled").
		Select("COALESCE(SUM(total), 0)").Scan(&currentSales).Error
	if err != nil {
		return nil, err
	}

	// Orders count last month
	// err = dr.db.Model(&models.OrderModel{}).
	// 	Where("created_at BETWEEN ? AND ?", lastStart, lastEnd).
	// 	Count(&lastMonthSalesCount).Error
	// if err != nil {
	// 	return nil, err
	// }
	err = dr.db.Model(&models.OrderModel{}).
		Where("created_at BETWEEN ? AND ?", lastStart, lastEnd).
		Where("order_status <> ?", "Cancelled").
		Count(&lastMonthSalesCount).Error
	if err != nil {
		return nil, err
	}

	// Total sales last month
	// err = dr.db.Model(&models.OrderModel{}).
	// 	Where("created_at BETWEEN ? AND ?", lastStart, lastEnd).
	// 	Select("COALESCE(SUM(total), 0)").Scan(&lastSales).Error
	// if err != nil {
	// 	return nil, err
	// }
	err = dr.db.Model(&models.OrderModel{}).
		Where("created_at BETWEEN ? AND ?", lastStart, lastEnd).
		Where("order_status <> ?", "Cancelled").
		Select("COALESCE(SUM(total), 0)").Scan(&lastSales).Error
	if err != nil {
		return nil, err
	}

	// Delivered orders count (current month)
	err = dr.db.Model(&models.OrderModel{}).
		Where("created_at BETWEEN ? AND ?", currentStart, currentEnd).
		Where("order_status = ?", "Delivered").
		Count(&currentDeliveredCount).Error
	if err != nil {
		return nil, err
	}

	// Delivered orders count (last month)
	err = dr.db.Model(&models.OrderModel{}).
		Where("created_at BETWEEN ? AND ?", lastStart, lastEnd).
		Where("order_status = ?", "Delivered").
		Count(&lastDeliveredCount).Error
	if err != nil {
		return nil, err
	}

	// Calculate sales growth %
	var salesGrowth float64
	if lastSales > 0 {
		salesGrowth = ((currentSales - lastSales) / lastSales) * 100
	} else if currentSales > 0 {
		salesGrowth = 100
	}

	// Calculate delivered orders growth %
	var deliveredGrowth float64
	if lastDeliveredCount > 0 {
		deliveredGrowth = (float64(currentDeliveredCount-lastDeliveredCount) / float64(lastDeliveredCount)) * 100
	} else if currentDeliveredCount > 0 {
		deliveredGrowth = 100
	}

	type OrderStatusCount struct {
		OrderStatus string
		Count       int64
	}
	var orderStatusCounts []OrderStatusCount

	err = dr.db.Model(&models.OrderModel{}).
		Select("order_status, COUNT(*) as count").
		Group("order_status").
		Scan(&orderStatusCounts).Error
	if err != nil {
		return nil, err
	}

	var CompletedOrdersCount, PendingOrdersCount, BalancingOrdersCount int64

	for _, osc := range orderStatusCounts {
		switch osc.OrderStatus {
		case "Completed":
			CompletedOrdersCount = osc.Count
		case "Pending":
			PendingOrdersCount = osc.Count
		case "In Progress":
			BalancingOrdersCount = osc.Count
		}
	}

	type ProductCount struct {
		Category string
		Count    int64
	}
	var productCounts []ProductCount
	err = dr.db.Model(&models.ProductModel{}).
		Select("category, COUNT(*) as count").
		Group("category").
		Scan(&productCounts).Error
	if err != nil {
		return nil, err
	}
	var BatteryPackCount, SolarCount, EBikeCount, ServiceCount, OtherCount int64

	for _, pc := range productCounts {
		switch pc.Category {
		case "BATTERY_PACK":
			BatteryPackCount = pc.Count
		case "SOLAR":
			SolarCount = pc.Count
		case "E_VEHICLE":
			EBikeCount = pc.Count
		case "SERVICE":
			ServiceCount = pc.Count
		case "OTHER":
			OtherCount = pc.Count
		}
	}

	type StatusCount struct {
		Status string
		Count  int64
	}

	var statusCounts []StatusCount

	err = dr.db.Model(&models.QuoteModel{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Scan(&statusCounts).Error
	if err != nil {
		return nil, err
	}

	var DraftedQuotesCount, RejectedQuotesCount, SubmittedQuotesCount, ConfirmedQuotesCount int64

	for _, sc := range statusCounts {
		switch sc.Status {
		case "Drafted":
			DraftedQuotesCount = sc.Count
		case "Rejected":
			RejectedQuotesCount = sc.Count
		case "Submitted":
			SubmittedQuotesCount = sc.Count
		case "Confirmed":
			ConfirmedQuotesCount = sc.Count
		}
	}

	// Get low stock inventory items
	var lowStockItems []dto.LowStockInventory
	err = dr.db.Model(&models.InventoryModel{}).
		Where("status = ?", "Low Stock").
		Select("id AS item_id, item_code, item_name, quantity_in_stock AS quantity, status").Limit(4).
		Scan(&lowStockItems).Error
	if err != nil {
		return nil, err
	}
	return &dto.DashboardData{
		LastMonthSales:              lastSales,
		LastMonthOrdersCount:        lastMonthSalesCount,
		CurrentMonthSales:           currentSales,
		SalesGrowthPercentage:       salesGrowth,
		DeleverdOrdersCount:         currentDeliveredCount,
		DeliveredOrderGrowthPercent: deliveredGrowth,
		CompletedOrdersCount:        CompletedOrdersCount,
		PendingOrdersCount:          PendingOrdersCount,
		BalancingOrdersCount:        BalancingOrdersCount,
		BatteryPackCount:            BatteryPackCount,
		SolarCount:                  SolarCount,
		EBikeCount:                  EBikeCount,
		ServiceCount:                ServiceCount,
		OtherCount:                  OtherCount,
		DraftedQuotesCount:          DraftedQuotesCount,
		RejectedQuotesCount:         RejectedQuotesCount,
		SubmittedQuotesCount:        SubmittedQuotesCount,
		ConfirmedQuotesCount:        ConfirmedQuotesCount,
		LowStockInventory:           lowStockItems,
	}, nil
}
