package report

import (
	dto "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/report"

	"github.com/gin-gonic/gin"
)

type ReportHandler struct {
	reportService report.Service
}

func NewReportHandler(svc report.Service) *ReportHandler {
	return &ReportHandler{
		svc,
	}
}
func SetupReportRoutes(router *gin.RouterGroup, reportHandler *ReportHandler, auditSvc auditlogs.Service) {
	report := router.Group("/reports")
	{
		authorizationRouter := report.Group("")

		authorizationRouter.GET("/inventory",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			reportHandler.GetInventoryReport,
		)
		authorizationRouter.GET("/product",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			reportHandler.GetProductsReport,
		)
		authorizationRouter.GET("/quote",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			reportHandler.GetQuotesReport,
		)
		authorizationRouter.GET("/order",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			reportHandler.GetOrdersReport,
		)
		authorizationRouter.GET("/sale",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			reportHandler.GetSalesReport,
		)
		authorizationRouter.GET("/repair",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			reportHandler.GetRepairsReport,
		)
		authorizationRouter.GET("/payment",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			reportHandler.GetPaymentsReport,
		)
	}
}
