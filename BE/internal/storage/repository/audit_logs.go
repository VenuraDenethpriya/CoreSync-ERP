package repository

import (
	"context"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"

	"gorm.io/gorm"
)

type AuditLogsRepository struct {
	db *gorm.DB
}

func NewAuditLogsRepository(db *gorm.DB) *AuditLogsRepository {
	return &AuditLogsRepository{
		db,
	}
}

func (r *AuditLogsRepository) Save(log domain.AuditLog) error {
	return r.db.Create(&log).Error
}

func (r *AuditLogsRepository) GetAuditLogs(ctx context.Context, query string, limit int, offset int) ([]*domain.AuditLog, int, error) {
	var auditLogModels []models.AuditLog

	queryDB := r.db.Model(&models.AuditLog{}).Preload("User")

	if query != "" {
		searchPattern := "%" + query + "%"
		queryDB = queryDB.Joins("LEFT JOIN users u ON u.clerk_id = audit_logs.user_id").
			Where(`
            (
                CAST(audit_logs.status_code AS TEXT) ILIKE ? OR
                audit_logs.action ILIKE ? OR
                u.first_name ILIKE ? OR
                u.last_name ILIKE ? OR
                audit_logs.description ILIKE ?
            ) AND audit_logs.status_code BETWEEN 200 AND 299
        `,
				searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
			)
	} else {
		queryDB = queryDB.Where("audit_logs.status_code BETWEEN ? AND ?", 200, 299)
	}

	// Count total matching logs
	var totalCount int64
	if err := queryDB.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination and order
	if err := queryDB.Order("audit_logs.created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&auditLogModels).Error; err != nil {
		return nil, 0, err
	}

	// Map to domain objects
	var auditLogs []*domain.AuditLog
	for _, model := range auditLogModels {
		auditLogs = append(auditLogs, model.AuditLogFromModelToDomain())
	}

	return auditLogs, int(totalCount), nil
}
func (r *AuditLogsRepository) CreateAuditLog(log *domain.AuditLog) (*domain.AuditLog, error) {

	modelLog := models.AuditLogFromDomain(log)

	if err := r.db.Create(modelLog).Error; err != nil {
		return nil, err
	}

	return modelLog.AuditLogFromModelToDomain(), nil
}
