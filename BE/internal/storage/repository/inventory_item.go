package repository

import (
	"context"
	"errors"
	"fmt"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"
	"strconv"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InventoryItemRepository struct {
	db *gorm.DB
}

func NewInventoryItemRepository(db *gorm.DB) *InventoryItemRepository {
	return &InventoryItemRepository{
		db,
	}

}

func (r *InventoryItemRepository) GenerateAndCreateBatch(tx *gorm.DB, restockID uuid.UUID, itemID uuid.UUID, baseItemCode string, quantity int) error {
	db := r.db
	if tx != nil {
		db = tx
	}

	datePart := time.Now().Format("060102")
	prefix := fmt.Sprintf("%s%s", baseItemCode, datePart)

	var lastItem models.InventoryItemModel
	var currentSequence int = 0

	err := db.Where("item_code LIKE ?", prefix+"%").
		Order("item_code desc").
		First(&lastItem).Error

	if err == nil {
		if len(lastItem.ItemCode) > 4 {
			lastFourDigits := lastItem.ItemCode[len(lastItem.ItemCode)-4:]
			if lastSeqNum, parseErr := strconv.Atoi(lastFourDigits); parseErr == nil {
				currentSequence = lastSeqNum
			}
		}
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	// 3. Generate the new batch
	var items []models.InventoryItemModel

	for i := 1; i <= quantity; i++ {
		currentSequence++

		uniqueCode := fmt.Sprintf("%s%04d", prefix, currentSequence)

		items = append(items, models.InventoryItemModel{
			ID:        uuid.New(),
			RestockID: restockID,
			ItemID:    itemID,
			ItemCode:  uniqueCode,
		})
	}
	return db.Create(&items).Error
}

func (ir *InventoryItemRepository) GetInventoryItemByCode(ctx context.Context, inventory_item *domain.InventoryItem) (*domain.InventoryItem, error) {
	var itemModel models.InventoryItemModel

	// err := ir.db.First(&itemModel, "item_code = ?", inventory_item.ItemCode).Error
	// if err != nil {
	// 	return nil, err
	// }
	// err := ir.db.Preload("Inventory").First(&itemModel, "item_code = ?", inventory_item.ItemCode).Error
	err := ir.db.Preload("Inventory").First(&itemModel, "item_code ILIKE ?", inventory_item.ItemCode).Error
	if err != nil {
		return nil, err
	}

	var usageModel models.InventoryItemUsageModel

	err = ir.db.Select("id").
		Where("item_id = ?", itemModel.ID).
		First(&usageModel).Error

	if err == nil {
		return nil, fmt.Errorf("This item already used")
	}

	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// domainInventoryItem := itemModel.InventoryItemModelToDomain()
	// return domainInventoryItem, nil
	domainInventoryItem := itemModel.InventoryItemModelToDomain()
	return domainInventoryItem, nil
}
