package auditlogs

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetAuditLogs(ctx context.Context, query string, limit int, offset int) ([]*domain.AuditLog, int, error) {
	return s.repo.GetAuditLogs(ctx, query, limit, offset)
}
