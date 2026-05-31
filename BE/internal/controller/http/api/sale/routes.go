package sale

import (
	"rims-backend/internal/controller/http/api/sale/call"
	"rims-backend/internal/controller/http/api/sale/salesperson"
	dto "rims-backend/internal/controller/http/dto/const"
	"rims-backend/internal/controller/http/middleware"
	auditlogs "rims-backend/internal/service/audit_logs"
	"rims-backend/internal/service/sale"

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
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			saleHandler.GetSales,
		)
		adminSale.PUT("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			saleHandler.UpdateSale,
			middleware.AuditMiddleware(auditSvc),
		)
		adminSale.DELETE("/:sale-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN)),
			saleHandler.DeleteSale,
			middleware.AuditMiddleware(auditSvc),
		)
		adminSale.GET("/:sale-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN)),
			saleHandler.GetSaleByID,
		)
		adminSale.GET("/sale-list",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			saleHandler.GetSalesList,
		)
	}

}
