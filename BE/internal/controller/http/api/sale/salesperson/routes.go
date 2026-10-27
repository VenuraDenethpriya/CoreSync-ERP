package salesperson

import (
	dto "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/sale"

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
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
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
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			salespersonHandler.GetSalespersonByID,
		)
		salesperson.GET("/salespersons-list",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			salespersonHandler.GetSalespersonsList,
		)
		salesperson.GET("/get-by-range",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			salespersonHandler.GetSalespersonsSaleByDateRange,
		)
	}
}
