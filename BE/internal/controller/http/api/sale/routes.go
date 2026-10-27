package sale

import (
	"CoreSync-backend/internal/controller/http/api/sale/call"
	"CoreSync-backend/internal/controller/http/api/sale/salesperson"
	dto "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/sale"

	"github.com/gin-gonic/gin"
)

type SaleHandler struct {
	saleService sale.Service
}

func NewSaleHandler(svc sale.Service) *SaleHandler {
	return &SaleHandler{
		saleService: svc,
	}
}
func SetupSaleRoutes(
	router *gin.RouterGroup,
	saleHandler *SaleHandler,
	salespersonHandler *salesperson.SalepersonHandler,
	callHandler *call.CallHandler,
	auditSvc auditlogs.Service,
) {
	sale := router.Group("/sales")
	{
		adminSale := sale.Group("")
		salesperson.SetupSalespersonRoutes(sale, salespersonHandler, auditSvc)
		call.SetupCallRoutes(sale, callHandler)

		adminSale.POST("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			saleHandler.CreateSale,
			middleware.AuditMiddleware(auditSvc),
		)
		adminSale.GET("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			saleHandler.GetSales,
		)
		adminSale.PUT("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD)),
			saleHandler.UpdateSale,
			middleware.AuditMiddleware(auditSvc),
		)
		adminSale.DELETE("/:sale-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.FINANCE_HEAD)),
			saleHandler.DeleteSale,
			middleware.AuditMiddleware(auditSvc),
		)
		adminSale.GET("/:sale-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			saleHandler.GetSaleByID,
		)
		adminSale.GET("/sale-list",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			saleHandler.GetSalesList,
		)
		adminSale.POST("/sales-target",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD)),
			saleHandler.CreateSalesTarget,
			middleware.AuditMiddleware(auditSvc),
		)
		adminSale.GET("/sales-target",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			saleHandler.GetSalesTargetsForSalespersons,
		)
		adminSale.DELETE("/sales-target/:id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.FINANCE_HEAD)),
			saleHandler.DeleteSalesTarget,
			middleware.AuditMiddleware(auditSvc),
		)
		adminSale.GET("/dashboard",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			saleHandler.GetSalesDashboardData,
		)
		adminSale.GET("/dashboard/:email",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.SALES_TEAM), string(dto.READ_ONLY)),
			saleHandler.GetSingleSalespersonDashboard,
		)
	}

}
