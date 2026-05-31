package salesperson

import (
	dto "rims-backend/internal/controller/http/dto/const"
	"rims-backend/internal/controller/http/middleware"
	auditlogs "rims-backend/internal/service/audit_logs"
	"rims-backend/internal/service/sale"

	"github.com/gin-gonic/gin"
)

type SalepersonHandler struct {
	saleService sale.Service
}

func NewSalepersonHandler(svc sale.Service) *SalepersonHandler {
	return &SalepersonHandler{
		saleService: svc,
	}
}
func SetupSalespersonRoutes(
	router *gin.RouterGroup,
	salespersonHandler *SalepersonHandler,
	auditSvc auditlogs.Service,
) {
	salesperson := router.Group("/salespersons")
	{
		salesperson.POST("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			salespersonHandler.CreateSalesperson,
			middleware.AuditMiddleware(auditSvc),
		)
		salesperson.GET("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			salespersonHandler.GetSalespersons,
		)
		salesperson.PUT("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			salespersonHandler.UpdateSalesperson,
			middleware.AuditMiddleware(auditSvc),
		)
		salesperson.DELETE("/:salesperson-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN)),
			salespersonHandler.DeleteSalesperson,
			middleware.AuditMiddleware(auditSvc),
		)
		salesperson.GET("/:salesperson-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN)),
			salespersonHandler.GetSalespersonByID,
		)
		salesperson.GET("/salespersons-list",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			salespersonHandler.GetSalespersonsList,
		)
		salesperson.GET("/get-by-range",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			salespersonHandler.GetSalespersonsSaleByDateRange,
		)
	}
}
