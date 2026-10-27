package finance

import (
	dto "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/finance"

	"github.com/gin-gonic/gin"
)

type FinanceHandler struct {
	financeService finance.Service
	auditService   auditlogs.Service
}

func NewFinanceHandler(svc finance.Service, auditSvc auditlogs.Service) *FinanceHandler {
	return &FinanceHandler{
		financeService: svc,
		auditService:   auditSvc,
	}
}
func SetupFinanceRoutes(router *gin.RouterGroup, financeHandler *FinanceHandler, auditSvc auditlogs.Service) {
	finance := router.Group("/finance")

	finance.POST("",
		middleware.ClerkAuthMiddleware(),
		middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF), string(dto.HR_HEAD)),
		financeHandler.CreatePurchaseOrder,
		middleware.AuditMiddleware(auditSvc),
	)

	finance.GET("",
		middleware.ClerkAuthMiddleware(),
		middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.HR_HEAD), string(dto.READ_ONLY)),
		financeHandler.GetPurchaseOrders,
	)
	finance.GET(":purchaseOrderId",
		middleware.ClerkAuthMiddleware(),
		middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.HR_HEAD), string(dto.READ_ONLY)),
		financeHandler.GetPurchaseOrderById,
	)
	finance.DELETE(":purchaseOrderId",
		middleware.ClerkAuthMiddleware(),
		middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
		financeHandler.DeletePurchaseOrder,
		middleware.AuditMiddleware(auditSvc),
	)
	finance.PUT("",
		middleware.ClerkAuthMiddleware(),
		middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.HR_HEAD)),
		financeHandler.UpdatePurchaseOrder,
		middleware.AuditMiddleware(auditSvc),
	)
	finance.GET("/items",
		middleware.ClerkAuthMiddleware(),
		middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF), string(dto.READ_ONLY)),
		financeHandler.GetPurchaseItems,
	)
}
