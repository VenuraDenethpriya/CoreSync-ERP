package dashboard

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *DashboardHandler) GetDashboardData(ctx *gin.Context) {
	dashboardData, err := ch.dashboardService.GetDashboardData()
	if err != nil {
		logger.Error(ctx, "Error getting dashboard data", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	common.HandleSuccess(ctx, common.StatusOK, dashboardData)
}
