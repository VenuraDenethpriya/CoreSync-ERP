package setting

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (settingHandler *SettingHandler) CreateAuditLogs(c *gin.Context) {
	logger.Info(c, "Create audit log request received")

	var req dto.CreateAuditLogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error(c, "Failed to bind request", zap.Error(err))
		common.ValidationError(c, err)
		return
	}

	auditlogsDomain := mapper.AuditLogRequestToDomain(&req)

	createdAuditLog, err := settingHandler.auditlogsService.CreateAuditLog(c, auditlogsDomain)
	if err != nil {
		logger.Error(c, "Failed to create audit log", zap.Error(err))
		common.HandleError(c, err)
		return
	}

	response := mapper.DomainToAuditLogResponse(createdAuditLog)

	common.HandleSuccess(c, common.StatusCreated, response)
	logger.Info(c, "Audit log created successfully", zap.Any("audit_log", createdAuditLog))
}
