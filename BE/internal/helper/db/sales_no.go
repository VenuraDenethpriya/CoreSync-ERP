package db

import (
	"fmt"
	"rims-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

func GenerateSalesNo(db *gorm.DB) (string, error) {
	today := time.Now().Format("060102")

	var count int64
	err := db.Model(&models.SaleModel{}).
		Where("DATE(created_at) = CURDATE()").
		Count(&count).Error
	if err != nil {
		return "", err
	}

	sequence := count + 1
	return fmt.Sprintf("%s%d", today, sequence), nil
}
