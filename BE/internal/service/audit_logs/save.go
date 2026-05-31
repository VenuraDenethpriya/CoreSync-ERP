package auditlogs

import "rims-backend/internal/service/domain"

func (s *service) Save(log domain.AuditLog) error {
	return s.repo.Save(log)
}
