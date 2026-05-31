package repository

import (
	"context"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type QuoteItemRepository struct {
	db *gorm.DB
}

// NewInventoryRepository creates a new inventory repository instance
func NewQuoteItemRepository(db *gorm.DB) *QuoteItemRepository {
	return &QuoteItemRepository{
		db,
	}
}
func (ur *QuoteItemRepository) CreateQuoteItem(ctx context.Context, quoteItem *domain.QuoteItem) (*domain.QuoteItem, error) {
	quoteItemModel := models.QuoteItemModelFromDomain(quoteItem)
	if err := ur.db.Create(quoteItemModel).Error; err != nil {
		logger.Error(ctx, "Error creating quote item", zap.String("method", "POST"), zap.String("path", "orders/quote"), zap.Any("quote", quoteItem), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Quote item created", zap.String("method", "POST"), zap.String("path", "orders/quote"), zap.Any("quote", quoteItem))
	return quoteItemModel.QuoteItemModelToDomain(), nil
}

func (ur *QuoteItemRepository) UpdateQuoteItem(ctx context.Context, quoteItem *domain.QuoteItem) (*domain.QuoteItem, error) {
	var quoteItemModel models.QuoteItemModel
	err := ur.db.First(&quoteItemModel, quoteItem.ID).Error
	if err != nil {
		return nil, err
	}
	quoteItemModel.ProductID = quoteItem.ProductID
	quoteItemModel.Quantity = quoteItem.Quantity
	quoteItemModel.UnitPrice = quoteItem.UnitPrice
	quoteItemModel.SubTotal = quoteItem.SubTotal
	quoteItemModel.Note = quoteItem.Note

	err = ur.db.Updates(&quoteItemModel).Error

	if err != nil {
		logger.Error(ctx, "Error updating quote item", zap.String("method", "PUT"), zap.String("path", "orders/quote"), zap.Any("quote item", quoteItem), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Quote item updated", zap.String("method", "PUT"), zap.String("path", "orders/quote"), zap.Any("quote item", quoteItem))
	return quoteItemModel.QuoteItemModelToDomain(), nil
}
func (qr *QuoteItemRepository) DeleteQuoteItemByID(ctx context.Context, id uuid.UUID) error {
	err := qr.db.WithContext(ctx).Delete(&models.QuoteItemModel{}, id).Error
	if err != nil {
		logger.Error(ctx, "Failed to delete quote item by ID", zap.Any("id", id), zap.Error(err))
		return err
	}
	logger.Info(ctx, "Successfully deleted quote item by ID", zap.Any("id", id))
	return nil
}

func (qr *QuoteItemRepository) GetQuoteItemsByQuoteID(ctx context.Context, quoteID uuid.UUID) ([]*domain.QuoteItem, error) {
	var modelsList []models.QuoteItemModel
	err := qr.db.WithContext(ctx).Where("quote_no = ?", quoteID).Find(&modelsList).Error
	if err != nil {
		logger.Error(ctx, "Failed to fetch quote items by quote ID", zap.Any("quote_id", quoteID), zap.Error(err))
		return nil, err
	}

	var domainItems []*domain.QuoteItem
	for _, m := range modelsList {
		domainItems = append(domainItems, m.QuoteItemModelToDomain())
	}
	return domainItems, nil
}
