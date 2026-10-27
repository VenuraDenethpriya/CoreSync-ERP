package sale

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (sh *SaleHandler) GetSalesDashboardData(ctx *gin.Context) {
	dashboardData, err := sh.saleService.GetSalesDashboardData(ctx)
	if err != nil {
		logger.Error(ctx, "Error getting sales dashboard data", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}

	response := dto.GetSalesDashboardDataResponse(dashboardData)

	logger.Info(ctx, "Sales dashboard data", zap.Any("sales dashboard", response))
	common.HandleSuccess(ctx, common.StatusOK, response)
}
