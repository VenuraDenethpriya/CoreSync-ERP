package repository

import (
	"context"
	"errors"
	"fmt"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/models"

	"github.com/google/uuid"

	"rims-backend/internal/service/domain"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type QuoteRepository struct {
	db *gorm.DB
}

// NewInventoryRepository creates a new inventory repository instance
func NewQuoteRepository(db *gorm.DB) *QuoteRepository {
	return &QuoteRepository{
		db,
	}
}

// CreateQuote creates a new quote in the database
func (ur *QuoteRepository) CreateQuote(ctx context.Context, quote *domain.Quote) (*domain.Quote, error) {
	quoteModel := models.QuoteModelFromDomain(quote)
	if err := ur.db.Create(quoteModel).Error; err != nil {
		logger.Error(ctx, "Error creating quote", zap.String("method", "POST"), zap.String("path", "orders/quote"), zap.Any("quote", quote), zap.Error(err))
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", quoteModel.CreatedBy).Error; err == nil {
		quoteModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", quoteModel.CreatedBy), zap.Error(err))
	}
	logger.Info(ctx, "Quote created", zap.String("method", "POST"), zap.String("path", "orders/quote"), zap.Any("quote", quote))
	return quoteModel.QuoteModelToDomain(), nil
}

func (ur *QuoteRepository) GetQuotes(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Quote, int, error) {
	searchPattern := "%" + searchQuery + "%"

	var quotes []*models.QuoteModel
	var totalCount int64

	// Count query with joins for accurate filtering
	if err := ur.db.Model(&models.QuoteModel{}).
		Joins("LEFT JOIN customers c ON c.customer_id = quotes.customer_id").
		Where(`
			quotes.quote_no ILIKE ? OR 
			c.first_name ILIKE ? OR 
			c.last_name ILIKE ? OR 
			quotes.status ILIKE ?`,
			searchPattern, searchPattern, searchPattern, searchPattern).
		Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	// Main query using Preload to get Customer relationship
	if err := ur.db.
		Preload("Customer").
		Joins("LEFT JOIN customers c ON c.customer_id = quotes.customer_id").
		Where(`
		c.first_name ILIKE ? OR 
        c.last_name ILIKE ? OR 
			quote_no ILIKE ? OR 
			status ILIKE ?`,
			searchPattern, searchPattern, searchPattern, searchPattern).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&quotes).Error; err != nil {
		return nil, 0, err
	}

	// Convert to domain
	var domainQuotes []*domain.Quote
	for _, q := range quotes {
		domainQuotes = append(domainQuotes, q.QuoteModelToDomain())
	}

	return domainQuotes, int(totalCount), nil
}

func (ur *QuoteRepository) UpdateQuoteStatus(ctx context.Context, quote *domain.Quote) (*domain.Quote, error) {
	var quoteModel models.QuoteModel
	err := ur.db.First(&quoteModel, quote.QuoteID).Error
	if err != nil {
		return nil, err
	}
	quoteModel.Status = quote.Status
	err = ur.db.Save(&quoteModel).Error
	if err != nil {
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", quoteModel.CreatedBy).Error; err == nil {
		quoteModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", quoteModel.CreatedBy), zap.Error(err))
	}
	return quoteModel.QuoteModelToDomain(), nil
}

func (ur *QuoteRepository) GetQuoteByID(ctx context.Context, quote *domain.Quote) (*domain.Quote, error) {
	var quoteModel models.QuoteModel
	err := ur.db.
		Preload("Customer").
		Preload("QuoteItems").
		Preload("QuoteItems.Name").
		Preload("Sale").
		Preload("Sale.SalespersonData").
		First(&quoteModel, "quote_id = ?", quote.QuoteID).Error
	if err != nil {
		return nil, err
	}
	return quoteModel.QuoteModelToDomain(), nil
}
func (ur *QuoteRepository) GetLastQuoteNo(ctx context.Context) (string, error) {
	var quote models.QuoteModel
	err := ur.db.Order("quote_no desc").First(&quote).Error
	if err != nil {
		return "", err
	}
	return quote.QuoteNo, nil
}

func (ur *QuoteRepository) UpdateQuote(ctx context.Context, quote *domain.Quote) (*domain.Quote, error) {
	var quoteModel models.QuoteModel
	err := ur.db.First(&quoteModel, quote.QuoteID).Error
	if err != nil {
		return nil, err
	}

	quoteModel.SubTotal = quote.SubTotal
	convertedCharges := models.ConvertAdditionalChargesForQuoteFromDomain(quote.AdditionalCharges)
	quoteModel.AdditionalCharges = convertedCharges
	quoteModel.Discount = quote.Discount
	quoteModel.Total = quote.Total
	quoteModel.Vat = quote.Vat
	quoteModel.IsCatalog = quote.IsCatalog
	quoteModel.Status = quote.Status
	quoteModel.PoNo = quote.PoNo

	err = ur.db.Save(&quoteModel).Error

	// err := ur.db.Model(&models.QuoteModel{}).Where("quote_id = ?", quote.QuoteID).Updates(map[string]interface{}{
	// 	"quote_no":           quote.QuoteNo,
	// 	"sub_total":          quote.SubTotal,
	// 	"additional_charges": quote.AdditionalCharges,
	// 	"discount":           quote.Discount,
	// 	"total":              quote.Total,
	// 	"status":             quote.Status,
	// }).Error

	if err != nil {
		logger.Error(ctx, "Error updating quote", zap.String("method", "PUT"), zap.String("path", "orders/quote"), zap.Any("quote", quote), zap.Error(err))
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", quoteModel.CreatedBy).Error; err == nil {
		quoteModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", quoteModel.CreatedBy), zap.Error(err))
	}

	logger.Info(ctx, "Quote updated", zap.String("method", "PUT"), zap.String("path", "orders/quote"), zap.Any("quote", quote))
	return quoteModel.QuoteModelToDomain(), nil
}

func (ur *QuoteRepository) GetQuoteType(ctx context.Context, types []string) (map[string]string, error) {
	latestQuotes := make(map[string]string)
	logger.Info(ctx, "Getting latest quote for each type", zap.Any("quote_types", types))

	for _, quoteType := range types {
		var quote models.QuoteModel
		err := ur.db.
			Unscoped().
			Where("type = ?", quoteType).
			Order("created_at DESC").
			First(&quote).Error

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				logger.Error(ctx, "No latest quote found for type", zap.String("quote_type", quoteType), zap.Error(err))
				continue
			}
			return nil, fmt.Errorf("failed to get latest quote for type %s: %w", quoteType, err)
		}

		logger.Info(ctx, "Latest quote found", zap.String("quote_type", quoteType), zap.String("quote_no", quote.QuoteNo))
		latestQuotes[quoteType] = quote.QuoteNo
	}

	return latestQuotes, nil
}

func (ur *QuoteRepository) GetAllQuotesDetails(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Quote, error) {
	query := ur.db.WithContext(ctx).
		Preload("Customer").
		Preload("QuoteItems").
		Preload("QuoteItems.Name").
		Preload("User").
		Preload("Sale").
		Preload("Sale.SalespersonData").
		Preload("Sale.User").
		Where("status IN ?", []string{"Confirmed", "Submitted"})

	if searchQuery != "" {
		searchPattern := "%" + searchQuery + "%"
		query = query.Where("quote_no ILIKE ?", searchPattern)
	}

	var quotes []*models.QuoteModel
	err := query.
		Order("updated_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&quotes).Error
	if err != nil {
		return nil, err
	}

	var domainQuotes []*domain.Quote
	for _, q := range quotes {
		domainQuotes = append(domainQuotes, q.QuoteModelToDomain())
	}
	return domainQuotes, nil
}

func (ur *QuoteRepository) DeleteQuote(ctx context.Context, quoteID uuid.UUID) (*domain.Quote, error) {
	var quoteModel models.QuoteModel
	if err := ur.db.Preload("QuoteItems").First(&quoteModel, "quote_id = ?", quoteID).Error; err != nil {
		return nil, err
	}

	err := ur.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("quote_no = ?", quoteID).Delete(&models.QuoteItemModel{}).Error; err != nil {
			return err
		}
		if err := tx.Where("quote_id = ?", quoteID).Delete(&models.QuoteModel{}).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", quoteModel.CreatedBy).Error; err == nil {
		quoteModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", quoteModel.CreatedBy), zap.Error(err))
	}
	return quoteModel.QuoteModelToDomain(), nil
}
