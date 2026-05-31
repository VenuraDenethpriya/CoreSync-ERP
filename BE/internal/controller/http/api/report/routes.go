package report

import (
	dto "rims-backend/internal/controller/http/dto/const"
	"rims-backend/internal/controller/http/middleware"
	auditlogs "rims-backend/internal/service/audit_logs"
	"rims-backend/internal/service/report"

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
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			reportHandler.GetInventoryReport,
		)
		authorizationRouter.GET("/product",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			reportHandler.GetProductsReport,
		)
		authorizationRouter.GET("/quote",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			reportHandler.GetQuotesReport,
		)
		authorizationRouter.GET("/order",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			reportHandler.GetOrdersReport,
		)
		authorizationRouter.GET("/sale",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			reportHandler.GetSalesReport,
		)
		authorizationRouter.GET("/repair",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			reportHandler.GetRepairsReport,
		)
	}
}
