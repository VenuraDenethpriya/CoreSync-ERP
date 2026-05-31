package repository

import (
	"context"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SalespersonRepository struct {
	db *gorm.DB
}

func NewSalespersonRepository(db *gorm.DB) *SalespersonRepository {
	return &SalespersonRepository{db: db}
}
func (sr *SalespersonRepository) CreateSalesperson(ctx context.Context, salesperson *domain.Salesperson) (*domain.Salesperson, error) {
	salespersonModel := models.SalespersonFromDomain(salesperson)
	if err := sr.db.WithContext(ctx).Create(salespersonModel).Error; err != nil {
		logger.Error(ctx, "Error creating salesperson", zap.String("method", "POST"), zap.String("path", "/salespersons"), zap.Any("salesperson", salesperson), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Salesperson created", zap.String("method", "POST"), zap.String("path", "/salespersons"), zap.Any("salesperson", salesperson))
	return salespersonModel.SalespersonFromModelToDomain(), nil
}

func (sr *SalespersonRepository) GetSalesperons(
	ctx context.Context,
	query string,
	limit int,
	offset int,
) ([]*domain.Salesperson, []int, []float64, int64, error) {

	var salespersons []models.SalespersonModel
	search := "%" + query + "%"

	// Base search query
	tx := sr.db.Where(`
        first_name ILIKE ?
        OR last_name ILIKE ?
        OR phone_no ILIKE ?
        OR email ILIKE ?
    `, search, search, search, search)

	// Count total records
	var total int64
	if err := tx.Model(&models.SalespersonModel{}).Count(&total).Error; err != nil {
		return nil, nil, nil, 0, err
	}

	// Pagination
	if err := tx.
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&salespersons).Error; err != nil {
		return nil, nil, nil, 0, err
	}

	// Convert to domain + collect IDs
	domainSalespersons := make([]*domain.Salesperson, 0, len(salespersons))
	salespersonIDs := make([]uuid.UUID, 0, len(salespersons))
	for _, s := range salespersons {
		domainSalespersons = append(domainSalespersons, s.SalespersonFromModelToDomain())
		salespersonIDs = append(salespersonIDs, s.ID)
	}

	// No salespersons? return empty response
	if len(salespersonIDs) == 0 {
		return domainSalespersons, []int{}, []float64{}, total, nil
	}

	// Aggregation: total sales & total commission per salesperson
	type AggResult struct {
		SalespersonID uuid.UUID `json:"salesperson_id"`
		TotalSales    int       `json:"total_sales"`
		TotalComm     float64   `json:"total_comm"`
	}

	var aggResults []AggResult

	// IMPORTANT: Use IN ?, NOT pq.Array()
	if err := sr.db.Raw(`
        SELECT 
            salesperson AS salesperson_id,
            COUNT(*) AS total_sales,
            COALESCE(SUM(commission), 0) AS total_comm
        FROM sales
        WHERE salesperson IN ? AND status = 'Confirmed'
        GROUP BY salesperson
    `, salespersonIDs).Scan(&aggResults).Error; err != nil {
		return nil, nil, nil, 0, err
	}

	// Map aggregation results by salesperson IDP
	salesMap := make(map[uuid.UUID]AggResult)
	for _, ar := range aggResults {
		salesMap[ar.SalespersonID] = ar
	}

	// Build aligned arrays for response
	totalSalesArr := make([]int, len(domainSalespersons))
	totalCommArr := make([]float64, len(domainSalespersons))

	for i, sp := range domainSalespersons {
		if agg, ok := salesMap[sp.ID]; ok {
			totalSalesArr[i] = agg.TotalSales
			totalCommArr[i] = agg.TotalComm
		} else {
			totalSalesArr[i] = 0
			totalCommArr[i] = 0
		}
	}

	return domainSalespersons, totalSalesArr, totalCommArr, total, nil
}

func (sr *SalespersonRepository) UpdateSalesperson(ctx context.Context, salesperson *domain.Salesperson) (*domain.Salesperson, error) {
	var existingSalesperson models.SalespersonModel

	err := sr.db.
		Preload("User").
		First(&existingSalesperson, "id = ?", salesperson.ID).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	existingSalesperson.FirstName = salesperson.FirstName
	existingSalesperson.LastName = salesperson.LastName
	existingSalesperson.PhoneNo = salesperson.PhoneNo
	existingSalesperson.Email = salesperson.Email

	if err := sr.db.Save(&existingSalesperson).Error; err != nil {
		return nil, err
	}

	var updated models.SalespersonModel
	err = sr.db.
		Preload("User").
		First(&updated, "id = ?", salesperson.ID).Error

	if err != nil {
		return nil, err
	}

	return updated.SalespersonFromModelToDomain(), nil
}

func (sr *SalespersonRepository) DeleteSalesperson(ctx context.Context, salesperson *domain.Salesperson) (*domain.Salesperson, error) {
	var salespersonModel models.SalespersonModel
	err := sr.db.First(&salespersonModel, "id = ?", salesperson.ID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, err
		}
		return nil, err
	}
	err = sr.db.Delete(&salespersonModel).Error
	if err != nil {
		logger.Error(ctx, "Error deleting salesperson", zap.String("method", "DELETE"), zap.String("path", "/salespersons/:salesperson-id"), zap.Any("salepersonID", salesperson.ID), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Salesperson deleted", zap.String("method", "DELETE"), zap.String("path", "/salesperson/:salesperson-id"), zap.Any("salespersonID", salesperson.ID))
	return salespersonModel.SalespersonFromModelToDomain(), nil
}

// func (sr *SalespersonRepository) GetSalespersonByID(
// 	ctx context.Context,
// 	s *domain.Salesperson,
// ) (*domain.Salesperson, int, float64, int, float64, error) {

// 	var salespersonModel models.SalespersonModel

// 	err := sr.db.
// 		WithContext(ctx).Preload("User").
// 		First(&salespersonModel, "id = ?", s.ID).Error

// 	if err != nil {
// 		return nil, 0, 0, 0, 0, err
// 	}

// 	// TOTAL SALES (ALL TIME)
// 	var totalSales int64
// 	sr.db.Raw(`
// 		SELECT COUNT(*)
// 		FROM sales
// 		WHERE salesperson = ?
// 	`, s.ID).Scan(&totalSales)

// 	// TOTAL COMMISSION (ALL TIME)
// 	var totalCommission float64
// 	sr.db.Raw(`
// 		SELECT COALESCE(SUM(commission), 0)
// 		FROM sales
// 		WHERE salesperson = ?
// 	`, s.ID).Scan(&totalCommission)

// 	// LAST 30 DAYS
// 	lastMonthStart := time.Now().Add(-30 * 24 * time.Hour)

// 	// TOTAL SALES (LAST 30 DAYS)
// 	var totalSalesLastMonth int64
// 	sr.db.Raw(`
// 		SELECT COUNT(*)
// 		FROM sales
// 		WHERE salesperson = ?
// 		AND date >= ?
// 	`, s.ID, lastMonthStart).Scan(&totalSalesLastMonth)

// 	// TOTAL COMMISSION (LAST 30 DAYS)
// 	var totalCommissionLastMonth float64
// 	sr.db.Raw(`
// 		SELECT COALESCE(SUM(commission), 0)
// 		FROM sales
// 		WHERE salesperson = ?
// 		AND date >= ?
// 	`, s.ID, lastMonthStart).Scan(&totalCommissionLastMonth)

//		return salespersonModel.SalespersonFromModelToDomain(),
//			int(totalSalesLastMonth),
//			totalCommissionLastMonth,
//			int(totalSales),
//			totalCommission,
//			nil
//	}

func (sr *SalespersonRepository) GetSalespersonByID(
	ctx context.Context,
	s *domain.Salesperson,
) (*domain.Salesperson, int, float64, int, float64, error) {

	var salespersonModel models.SalespersonModel

	err := sr.db.
		WithContext(ctx).Preload("User").
		First(&salespersonModel, "id = ?", s.ID).Error

	if err != nil {
		return nil, 0, 0, 0, 0, err
	}

	// TOTAL SALES (ALL TIME)
	var totalSales int64
	sr.db.Raw(`
		SELECT COUNT(*) 
		FROM sales 
		WHERE salesperson = ?
		AND status = 'Confirmed'
	`, s.ID).Scan(&totalSales)

	// TOTAL COMMISSION (ALL TIME)
	var totalCommission float64
	sr.db.Raw(`
		SELECT COALESCE(SUM(commission), 0)
		FROM sales
		WHERE salesperson = ?
		AND status = 'Confirmed'
	`, s.ID).Scan(&totalCommission)

	// Calculate the date range: 30th of last month to 30th of this month
	now := time.Now()
	year := now.Year()
	month := now.Month()

	// 30th of last month
	lastMonth := month - 1
	if lastMonth == 0 {
		lastMonth = 12
		year--
	}
	lastMonth30th := time.Date(year, lastMonth, 30, 0, 0, 0, 0, time.Local)

	// 30th of this month
	thisMonth30th := time.Date(now.Year(), month, 30, 23, 59, 59, 0, time.Local)

	// TOTAL SALES (FROM 30TH LAST MONTH TO 30TH THIS MONTH)
	var totalSalesThisMonth int64
	sr.db.Raw(`
	SELECT COUNT(*) 
	FROM sales 
	WHERE salesperson = ?
	AND date >= ?
	AND date <= ?
	AND status = 'Confirmed'
`, s.ID, lastMonth30th, thisMonth30th).Scan(&totalSalesThisMonth)

	// TOTAL COMMISSION (FROM 30TH LAST MONTH TO 30TH THIS MONTH)
	var totalCommissionThisMonth float64
	sr.db.Raw(`
	SELECT COALESCE(SUM(commission), 0)
	FROM sales
	WHERE salesperson = ?
	AND date >= ?
	AND date <= ?
	AND status = 'Confirmed'
`, s.ID, lastMonth30th, thisMonth30th).Scan(&totalCommissionThisMonth)

	return salespersonModel.SalespersonFromModelToDomain(),
		int(totalSalesThisMonth),
		totalCommissionThisMonth,
		int(totalSales),
		totalCommission,
		nil
}

func (sr *SalespersonRepository) GetSalesperonsList(ctx context.Context) ([]*domain.Salesperson, error) {
	var salespersons []*models.SalespersonModel

	if err := sr.db.WithContext(ctx).
		Select("id", "first_name", "last_name", "phone_no").
		Find(&salespersons).Error; err != nil {
		return nil, err
	}

	result := make([]*domain.Salesperson, 0, len(salespersons))
	for _, sp := range salespersons {
		result = append(result, &domain.Salesperson{
			ID:        sp.ID,
			FirstName: sp.FirstName,
			LastName:  sp.LastName,
			PhoneNo:   sp.PhoneNo,
		})
	}

	return result, nil
}

func (sr *SalespersonRepository) GetSalesAndCommissionByDateRange(
	salespersonID uuid.UUID, start, end time.Time,
) (int, float64, error) {

	type AggResult struct {
		TotalSales int     `json:"total_sales"`
		TotalComm  float64 `json:"total_comm"`
	}

	var agg AggResult

	// Query the sales table directly
	if err := sr.db.Model(&models.SaleModel{}).
		Select("COUNT(*) AS total_sales, COALESCE(SUM(commission),0) AS total_comm").
		Where("salesperson = ? AND date BETWEEN ? AND ? AND status = 'Confirmed'", salespersonID, start, end).
		Scan(&agg).Error; err != nil {
		return 0, 0, err
	}

	return agg.TotalSales, agg.TotalComm, nil
}
