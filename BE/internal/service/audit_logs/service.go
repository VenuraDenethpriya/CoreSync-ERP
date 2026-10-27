package auditlogs

import (
	"CoreSync-backend/internal/service/domain"
	"CoreSync-backend/internal/storage/repository"
	"context"
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
