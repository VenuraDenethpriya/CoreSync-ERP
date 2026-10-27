package repository

import (
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/models"
	"CoreSync-backend/internal/service/domain"
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SaleRepository struct {
	db *gorm.DB
}

func NewSaleRepository(db *gorm.DB) *SaleRepository {
	return &SaleRepository{db: db}
}

func (sr *SaleRepository) CreateSale(ctx context.Context, sale *domain.Sale) (*domain.Sale, error) {
	var createdSaleModel *models.SaleModel

	err := sr.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {

		today := time.Now().Format("060102")

		var count int64
		if err := tx.Model(&models.SaleModel{}).
			Where("DATE(created_at) = CURRENT_DATE").
			Count(&count).Error; err != nil {
			return err
		}

		sequence := count + 1
		salesNo := fmt.Sprintf("%s%d", today, sequence)

		saleModel := models.SaleFromDomain(sale)
		saleModel.SalesNo = salesNo
		createdSaleModel = saleModel

		if err := tx.Create(saleModel).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		logger.Error(ctx, "Error creating sale", zap.String("method", "POST"), zap.String("path", "/sales"), zap.Any("sale", sale), zap.Error(err))
		return nil, err
	}

	logger.Info(ctx, "Sale created", zap.String("method", "POST"), zap.String("path", "/sales"), zap.Any("sale", createdSaleModel))

	return createdSaleModel.SaleFromModelToDomain(), nil
}

func (sr *SaleRepository) GetSales(ctx context.Context, query string, status string, limit int, offset int, userRole string, clerkID string, userEmail string) ([]*domain.Sale, int64, error) {
	var sales []models.SaleModel

	tx := sr.db.
		Preload("SalespersonData").
		Preload("User").
		Joins("LEFT JOIN salespersons AS salesperson_data ON salesperson_data.id = sales.salesperson").
		Joins("LEFT JOIN users AS creator ON creator.clerk_id = sales.updated_by")

	fmt.Printf("DEBUG => UserRole: '%s', UserEmail: '%s'\n", userRole, userEmail)

	if userRole == "SALES_TEAM" {
		tx = tx.Where("salesperson_data.email = ?", userEmail)
	}

	if query != "" {
		search := "%" + query + "%"
		tx = tx.Where(`
            sales.sales_no ILIKE ?
            OR sales.sales_type ILIKE ?
            OR sales.status ILIKE ?
            OR sales.customer_name ILIKE ?
            OR sales.customer_phone ILIKE ?
            OR salesperson_data.first_name ILIKE ?
            OR salesperson_data.last_name ILIKE ?
            OR creator.first_name ILIKE ?
            OR creator.last_name ILIKE ?
        `,
			search, search, search, search, search, search, search, search, search,
		)
	}

	if status == "" {
		status = "Confirmed"
	}

	if status != "All" {
		tx = tx.Where("sales.status ILIKE ?", status)
	}

	var total int64
	if err := tx.Model(&models.SaleModel{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := tx.Limit(limit).
		Offset(offset).
		Order("sales.created_at DESC").
		Find(&sales).Error; err != nil {
		return nil, 0, err
	}

	var domainSales []*domain.Sale
	for _, s := range sales {
		domainSale := s.SaleFromModelToDomain()

		domainSale.SalespersonData = s.SalespersonData.SalespersonFromModelToDomain()

		if s.User != nil && s.User.ID != uuid.Nil {
			domainSale.UpdatedBy = strings.TCoreSyncpace(
				s.User.FirstName + " " + s.User.LastName,
			)
		}

		domainSales = append(domainSales, domainSale)
	}

	return domainSales, total, nil
}

func (sr *SaleRepository) UpdateSale(ctx context.Context, sale *domain.Sale) (*domain.Sale, error) {
	var existingSale models.SaleModel

	err := sr.db.
		Preload("SalespersonData").
		Preload("User").
		First(&existingSale, "sales_id = ?", sale.SalesID).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	updates := map[string]interface{}{}

	if sale.Salesperson != uuid.Nil {
		updates["salesperson"] = sale.Salesperson
	}

	if sale.SalesType != "" {
		updates["sales_type"] = sale.SalesType
	}

	if sale.Status != "" {
		updates["status"] = sale.Status
	}

	if sale.Commission != nil {
		updates["commission"] = *sale.Commission
	}

	if !sale.Date.IsZero() {
		updates["date"] = sale.Date
	}

	if sale.CustomerName != "" {
		updates["customer_name"] = sale.CustomerName
	}

	if sale.CustomerPhone != "" {
		updates["customer_phone"] = sale.CustomerPhone
	}

	if sale.Description != "" {
		updates["description"] = sale.Description
	}

	if sale.RecordingURL != "" {
		updates["recording_url"] = sale.RecordingURL
	}

	updates["updated_at"] = sale.UpdatedAt
	updates["updated_by"] = sale.UpdatedBy

	if err := sr.db.Model(&existingSale).Updates(updates).Error; err != nil {
		return nil, err
	}

	var updated models.SaleModel
	err = sr.db.
		Preload("SalespersonData").
		Preload("User").
		First(&updated, "sales_id = ?", sale.SalesID).Error

	if err != nil {
		return nil, err
	}

	return updated.SaleFromModelToDomain(), nil
}

func (sr *SaleRepository) DeleteSale(ctx context.Context, sale *domain.Sale) (*domain.Sale, error) {
	var saleModel models.SaleModel
	err := sr.db.First(&saleModel, "sales_id = ?", sale.SalesID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, err
		}
		return nil, err
	}
	err = sr.db.Delete(&saleModel).Error
	if err != nil {
		logger.Error(ctx, "Error deleting sale", zap.String("method", "DELETE"), zap.String("path", "/sales/:sale-id"), zap.Any("saleID", sale.SalesID), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Sale deleted", zap.String("method", "DELETE"), zap.String("path", "/sales/:sale-id"), zap.Any("saleID", sale.SalesID))
	return saleModel.SaleFromModelToDomain(), nil
}

func (sr *SaleRepository) GetSaleByID(ctx context.Context, sale *domain.Sale) (*domain.Sale, error) {
	var saleModel models.SaleModel
	err := sr.db.WithContext(ctx).
		Preload("SalespersonData").
		Preload("User").
		First(&saleModel, "sales_id = ?", sale.SalesID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return saleModel.SaleFromModelToDomain(), nil
}

func (sr *SaleRepository) GetSalesList(ctx context.Context, query string, limit int, offset int) ([]*domain.Sale, error) {
	var sales []models.SaleModel

	search := "%" + query + "%"

	tx := sr.db.
		Preload("SalespersonData").
		Preload("User").
		Where(`sales_no ILIKE ?`, search)

	if err := tx.Limit(limit).
		Offset(offset).
		Order("sales.created_at DESC").
		Find(&sales).Error; err != nil {
		return nil, err
	}

	var domainSales []*domain.Sale
	for _, s := range sales {
		domainSale := s.SaleFromModelToDomain()

		domainSale.SalespersonData = s.SalespersonData.SalespersonFromModelToDomain()

		domainSales = append(domainSales, domainSale)
	}

	return domainSales, nil
}
func (sr *SaleRepository) CreateSalesTarget(ctx context.Context, salesTarget *domain.SalesTarget) (*domain.SalesTarget, error) {
	salesTargetModel := models.SalesTargetFromDomain(salesTarget)
	if err := sr.db.Create(salesTargetModel).Error; err != nil {
		logger.Error(ctx, "Error creating sales target: ", zap.String("method", "POST"), zap.String("path", "sales target"), zap.Any("sales target", salesTargetModel), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Sales target created", zap.String("method", "POST"), zap.String("path", "sales target"), zap.Any("sales target", salesTargetModel))
	return salesTargetModel.SalesTargetFromModelToDomain(), nil
}

func (sr *SaleRepository) GetSalesTargetsForSalespersons(ctx context.Context, salespersonID uuid.UUID, startDate, endDate time.Time) ([]domain.SalesTarget, error) {
	var results []domain.SalesTarget

	current := time.Date(startDate.Year(), startDate.Month(), 1, 0, 0, 0, 0, startDate.Location())
	end := time.Date(endDate.Year(), endDate.Month(), 1, 0, 0, 0, 0, endDate.Location())

	for !current.After(end) {
		year := current.Year()
		month := int(current.Month())

		var targetModel models.SalesTargetModel
		var targetID uuid.UUID
		var targetAmount float64

		err := sr.db.Model(&models.SalesTargetModel{}).
			Where("salesperson_id = ? AND month = ? AND year = ?", salespersonID, month, year).
			First(&targetModel).Error

		if err == nil {
			targetID = targetModel.ID
			targetAmount = targetModel.TargetAmount
		} else {
			targetID = uuid.Nil
			targetAmount = 0
		}

		var totals struct {
			TotalSale       float64
			TotalCommission float64
		}

		sr.db.Table("sales").
			Select("COALESCE(SUM(orders.total), 0) as total_sale, COALESCE(SUM(sales.commission), 0) as total_commission").
			Joins("LEFT JOIN orders ON orders.sales_id = sales.sales_id").
			Where("sales.salesperson = ? AND EXTRACT(MONTH FROM sales.date) = ? AND EXTRACT(YEAR FROM sales.date) = ? AND sales.status = 'Confirmed'", salespersonID, month, year).
			Scan(&totals)

		results = append(results, domain.SalesTarget{
			ID:           targetID,
			Month:        month,
			Year:         year,
			TargetAmount: targetAmount,
			Sale:         totals.TotalSale,
			Commission:   totals.TotalCommission,
		})

		current = current.AddDate(0, 1, 0)
	}

	return results, nil
}

func (sr *SaleRepository) DeleteSalesTarget(ctx context.Context, salesTarget *domain.SalesTarget) (*domain.SalesTarget, error) {
	var salesTargetModel models.SalesTargetModel
	err := sr.db.First(&salesTargetModel, "id = ?", salesTarget.ID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, err
		}
		return nil, err
	}
	err = sr.db.Delete(&salesTargetModel).Error
	if err != nil {
		logger.Error(ctx, "Error deleting sales target", zap.String("method", "DELETE"), zap.String("path", "/sales/sales-target/:sales-target-id"), zap.Any("ID", salesTarget.ID), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Sales target deleted", zap.String("method", "DELETE"), zap.String("path", "/sales/sales-target/:sales-target-id"), zap.Any("ID", salesTarget.ID))
	return salesTargetModel.SalesTargetFromModelToDomain(), nil
}

func (sr *SaleRepository) GetSalesDashboardData(ctx context.Context) (*domain.SalesDashboard, error) {
	var dashboard domain.SalesDashboard
	now := time.Now()

	// ---------------------------------------------------------
	// Fetch LAST MONTH's Data & Date Range
	// ---------------------------------------------------------
	// Start of last month (e.g., June 1st)
	lmStart := time.Date(now.Year(), now.Month()-1, 1, 0, 0, 0, 0, now.Location())
	// End of last month (e.g., June 30th at 23:59:59)
	lmEnd := time.Date(now.Year(), now.Month(), 0, 23, 59, 59, 0, now.Location())

	dashboard.LastMonthDate = domain.DateRange{
		StartDate: lmStart,
		EndDate:   lmEnd,
	}

	lmMonth := int(lmStart.Month())
	lmYear := lmStart.Year()

	queryLastMonth := `
		SELECT 
			sp.first_name || ' ' || sp.last_name AS salesperson_name,
			COALESCE(NULLIF(st.target_amount, 0), 10000000) AS target,
			COALESCE(SUM(o.total), 0) AS sales   
		FROM salespersons sp
		LEFT JOIN sales_targets st 
			ON st.salesperson_id = sp.id AND st.month = ? AND st.year = ?
		LEFT JOIN sales s 
			ON s.salesperson = sp.id 
			AND EXTRACT(MONTH FROM s.date) = ? 
			AND EXTRACT(YEAR FROM s.date) = ?
			AND s.status = 'Confirmed'
		LEFT JOIN orders o 
			ON o.sales_id = s.sales_id       
		GROUP BY sp.id, sp.first_name, sp.last_name, st.target_amount
		ORDER BY salesperson_name;
	`
	if err := sr.db.Raw(queryLastMonth, lmMonth, lmYear, lmMonth, lmYear).Scan(&dashboard.LastMonthData).Error; err != nil {
		return nil, err
	}

	// ---------------------------------------------------------
	// Fetch LAST 12 MONTHS Data & Date Range
	// ---------------------------------------------------------
	// Start of 11 months ago (Total 12 months including this month)
	lyStart := time.Date(now.Year(), now.Month()-11, 1, 0, 0, 0, 0, now.Location())
	// End of the current month
	lyEnd := time.Date(now.Year(), now.Month()+1, 0, 23, 59, 59, 0, now.Location())

	dashboard.LastYearDate = domain.DateRange{
		StartDate: lyStart,
		EndDate:   lyEnd,
	}

	queryLastYear := `
		WITH date_range AS (
			SELECT generate_series(
				date_trunc('month', current_date - interval '11 months'),
				date_trunc('month', current_date),
				'1 month'::interval
			)::date AS month_date
		)
		SELECT 
			TRIM(TO_CHAR(d.month_date, 'Month')) AS month_name,
			sp.first_name || ' ' || sp.last_name AS salesperson_name,
			COALESCE(NULLIF(st.target_amount, 0), 10000000) AS target,
			COALESCE(SUM(o.total), 0) AS sales 
		FROM date_range d
		CROSS JOIN salespersons sp
		LEFT JOIN sales_targets st 
			ON st.salesperson_id = sp.id 
			AND st.month = EXTRACT(MONTH FROM d.month_date) 
			AND st.year = EXTRACT(YEAR FROM d.month_date)
		LEFT JOIN sales s 
			ON s.salesperson = sp.id 
			AND EXTRACT(MONTH FROM s.date) = EXTRACT(MONTH FROM d.month_date) 
			AND EXTRACT(YEAR FROM s.date) = EXTRACT(YEAR FROM d.month_date)
			AND s.status = 'Confirmed'
		LEFT JOIN orders o 
			ON o.sales_id = s.sales_id   
		GROUP BY d.month_date, sp.id, sp.first_name, sp.last_name, st.target_amount
		ORDER BY d.month_date DESC, salesperson_name;
	`
	if err := sr.db.Raw(queryLastYear).Scan(&dashboard.LastYearData).Error; err != nil {
		return nil, err
	}

	return &dashboard, nil
}

func (sr *SaleRepository) GetSingleSalespersonDashboard(ctx context.Context, email string) (*domain.SingleSalespersonDashboard, error) {
	var dashboard domain.SingleSalespersonDashboard
	now := time.Now()

	// Get the salesperson's UUID using their email
	var salespersonIDStr string

	err := sr.db.Table("salespersons").Select("id").Where("email = ?", email).Scan(&salespersonIDStr).Error
	if err != nil {
		return nil, err
	}

	// Handle case where email doesn't exist in DB
	if salespersonIDStr == "" {
		return nil, fmt.Errorf("no salesperson found with email: %s", email)
	}

	salespersonID, err := uuid.Parse(salespersonIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid salesperson UUID format: %v", err)
	}
	// Handle case where email doesn't exist in DB
	if salespersonID == uuid.Nil {
		return nil, fmt.Errorf("no salesperson found with email: %s", email)
	}

	// ---------------------------------------------------------
	// THIS MONTH'S DATA (1st to end of current month)
	// ---------------------------------------------------------
	tmStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	tmEnd := time.Date(now.Year(), now.Month()+1, 0, 23, 59, 59, 0, now.Location())

	dashboard.ThisMonthDate = domain.DateRange{
		StartDate: tmStart,
		EndDate:   tmEnd,
	}

	tmMonth := int(tmStart.Month())
	tmYear := tmStart.Year()

	queryThisMonth := `
		SELECT 
			COALESCE(NULLIF(MAX(st.target_amount), 0), 10000000) AS target,
			COALESCE(SUM(o.total), 0) AS sales
		FROM salespersons sp
		LEFT JOIN sales_targets st 
			ON st.salesperson_id = sp.id AND st.month = ? AND st.year = ?
		LEFT JOIN sales s 
			ON s.salesperson = sp.id 
			AND EXTRACT(MONTH FROM s.date) = ? 
			AND EXTRACT(YEAR FROM s.date) = ?
			AND s.status = 'Confirmed'
		LEFT JOIN orders o 
			ON o.sales_id = s.sales_id
		WHERE sp.id = ?;
	`
	if err := sr.db.Raw(queryThisMonth, tmMonth, tmYear, tmMonth, tmYear, salespersonID).Scan(&dashboard.ThisMonthData).Error; err != nil {
		return nil, err
	}

	// ---------------------------------------------------------
	// LAST 12 MONTHS DATA
	// ---------------------------------------------------------
	lyStart := time.Date(now.Year(), now.Month()-11, 1, 0, 0, 0, 0, now.Location())
	dashboard.LastYearDate = domain.DateRange{
		StartDate: lyStart,
		EndDate:   tmEnd,
	}

	queryLastYear := `
		WITH date_range AS (
			SELECT generate_series(
				date_trunc('month', current_date - interval '11 months'),
				date_trunc('month', current_date),
				'1 month'::interval
			)::date AS month_date
		)
		SELECT 
			TRIM(TO_CHAR(d.month_date, 'Month')) AS month_name,
			COALESCE(SUM(o.total), 0) AS total_sale
		FROM date_range d
		LEFT JOIN sales s 
			ON s.salesperson = ? 
			AND EXTRACT(MONTH FROM s.date) = EXTRACT(MONTH FROM d.month_date) 
			AND EXTRACT(YEAR FROM s.date) = EXTRACT(YEAR FROM d.month_date)
			AND s.status = 'Confirmed'
		LEFT JOIN orders o 
			ON o.sales_id = s.sales_id
		GROUP BY d.month_date
		ORDER BY d.month_date DESC;
	`
	if err := sr.db.Raw(queryLastYear, salespersonID).Scan(&dashboard.LastYearData).Error; err != nil {
		return nil, err
	}

	return &dashboard, nil
}
