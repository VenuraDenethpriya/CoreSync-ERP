package mapper

import (
	dto "rims-backend/internal/controller/http/dto"
	domain "rims-backend/internal/service/domain"
)

func AuditLogRequestToDomain(req *dto.CreateAuditLogRequest) *domain.AuditLog {
	return &domain.AuditLog{
		Action:      req.Action,
		StatusCode:  req.StatusCode,
		UserID:      req.User,
		Description: req.Description,
	}
}

func DomainToAuditLogResponse(log *domain.AuditLog) *dto.CreateAuditLogResponse {
	return &dto.CreateAuditLogResponse{
		ID:          log.ID,
		StatusCode:  log.StatusCode,
		Action:      log.Action,
		UserName:    log.UserID,
		Description: log.Description,
		CreatedAt:   log.CreatedAt,
	}
}
