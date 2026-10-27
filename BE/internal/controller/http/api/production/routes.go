package production

import (
	dto "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/production"

	"github.com/gin-gonic/gin"
)

type ProductionHandler struct {
	productionService production.Service
}

func NewProductionHandler(svc production.Service) *ProductionHandler {
	return &ProductionHandler{
		svc,
	}
}
func SetupProductionRoutes(
	router *gin.RouterGroup,
	productionHandler *ProductionHandler,
	auditSvc auditlogs.Service) {
	production := router.Group("/productions")
	{

		authorizationRouter := production.Group("")
		authorizationRouter.POST("/casing",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			productionHandler.CreateCasing,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/casing",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			productionHandler.GetCasings,
		)
		authorizationRouter.POST("/wire-harness",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			productionHandler.CreateWireHarness,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/wire-harness",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			productionHandler.GetWireHarness,
		)

	}
}
