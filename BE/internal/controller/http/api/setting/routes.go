package setting

import (
	dto "rims-backend/internal/controller/http/dto/const"
	"rims-backend/internal/controller/http/middleware"
	auditlogs "rims-backend/internal/service/audit_logs"

	"github.com/gin-gonic/gin"
)

type SettingHandler struct {
	auditlogsService auditlogs.Service
}

func NewSettingHandler(svc auditlogs.Service) *SettingHandler {
	return &SettingHandler{
		auditlogsService: svc,
	}
}
func SetupSettingRoutes(router *gin.RouterGroup, settingHandler *SettingHandler) {
	setting := router.Group("/settings")
	{
		authorizationRouter := setting.Group("")
		{
			authorizationRouter.GET("/logs",
				middleware.ClerkAuthMiddleware(),
				middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN)),
				settingHandler.GetAuditLogs,
			)
			authorizationRouter.POST("/logs",
				middleware.ClerkAuthMiddleware(),
				middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN)),
				settingHandler.CreateAuditLogs,
			)
		}
	}
}
