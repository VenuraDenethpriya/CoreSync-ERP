package setting

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (sh *SettingHandler) GetAuditLogs(ctx *gin.Context) {
	logger.Info(ctx, "Get audit logs request received")

	var searchParams dto.GetAuditLogsRequest
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logs, totalLogs, err := sh.auditlogsService.GetAuditLogs(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting audit logs", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	dtoLogs := make([]dto.GetAuditLogResponse, 0, len(logs))
	for _, log := range logs {
		userName := ""
		if log.User != nil {
			userName = log.User.FirstName + " " + log.User.LastName
		}
		dtoLogs = append(dtoLogs, dto.GetAuditLogResponse{
			ID:          log.ID,
			StatusCode:  log.StatusCode,
			Action:      log.Action,
			UserName:    userName,
			Description: log.Description,
			CreatedAt:   log.CreatedAt,
		})
	}

	logger.Info(ctx, "Audit logs retrieved", zap.Int("count", len(dtoLogs)))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetAuditLogsResponse(totalLogs, dtoLogs))
}
