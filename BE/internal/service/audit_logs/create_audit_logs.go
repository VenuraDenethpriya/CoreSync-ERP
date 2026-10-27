package auditlogs

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateAuditLog(ctx context.Context, log *domain.AuditLog) (*domain.AuditLog, error) {

	createdLog, err := s.repo.CreateAuditLog(log)
	if err != nil {
		return nil, err
	}
	return createdLog, nil
}
