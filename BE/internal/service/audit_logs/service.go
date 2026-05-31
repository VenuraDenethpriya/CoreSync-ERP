package auditlogs

import (
	"context"
	"rims-backend/internal/service/domain"
	"rims-backend/internal/storage/repository"
)

type Service interface {
	Save(log domain.AuditLog) error
	CreateAuditLog(ctx context.Context, log *domain.AuditLog) (*domain.AuditLog, error)
	GetAuditLogs(ctx context.Context, query string, limit int, offset int) ([]*domain.AuditLog, int, error)
}
type service struct {
	repo repository.AuditLogsRepository
}

func NewService(auditRepo repository.AuditLogsRepository) Service {
	return &service{repo: auditRepo}
}
