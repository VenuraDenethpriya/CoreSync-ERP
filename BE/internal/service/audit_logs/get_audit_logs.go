package auditlogs

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetAuditLogs(ctx context.Context, query string, limit int, offset int) ([]*domain.AuditLog, int, error) {
	return s.repo.GetAuditLogs(ctx, query, limit, offset)
}
