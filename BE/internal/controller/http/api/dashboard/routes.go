package dashboard

import (
	"rims-backend/internal/service/dashboard"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	dashboardService dashboard.Service
}

func NewDashboardHandler(svc dashboard.Service) *DashboardHandler {
	return &DashboardHandler{
		dashboardService: svc,
	}
}
func SetupDashboardRoutes(router *gin.RouterGroup, dashboardHandler *DashboardHandler) {
	dashboard := router.Group("/dashboard")
	{
		authorizationRouter := dashboard.Group("")
		authorizationRouter.GET("",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF)),
			dashboardHandler.GetDashboardData)
	}
}
