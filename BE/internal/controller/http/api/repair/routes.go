package repair

import (
	"rims-backend/internal/controller/http/middleware"
	auditlogs "rims-backend/internal/service/audit_logs"
	"rims-backend/internal/service/repair"

	"github.com/gin-gonic/gin"
)

type RepairHandler struct {
	repairService repair.Service
}

func NewRepairHandler(svc repair.Service) *RepairHandler {
	return &RepairHandler{
		svc,
	}
}
func SetupRepairRoutes(
	router *gin.RouterGroup,
	repairHandler *RepairHandler,
	auditSvc auditlogs.Service) {

	repair := router.Group("/repairs")
	{
		authorizationRouter := repair.Group("")

		authorizationRouter.POST("",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			repairHandler.CreateRepair,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.PUT("/:repair-id",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			repairHandler.UpdateRepair,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.DELETE("/:repair-id",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			repairHandler.DeleteRepair,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/:repair-id",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF)),
			repairHandler.GetRepairByID,
		)
		authorizationRouter.GET("",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			repairHandler.GetRepairs,
		)
		authorizationRouter.GET("/last-job-no",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			repairHandler.GetLastRepairNo,
		)
		authorizationRouter.POST("/repair-usage",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF)),
			repairHandler.CreateRepairItemUsage,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/usage",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF)),
			repairHandler.GetRepairItemUsage,
		)
	}
}
