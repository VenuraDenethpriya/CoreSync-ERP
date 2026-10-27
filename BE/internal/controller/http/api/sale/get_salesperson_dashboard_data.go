package sale

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (sh *SaleHandler) GetSingleSalespersonDashboard(ctx *gin.Context) {
	var req dto.GetSalesBySalespersonRequest

	if err := ctx.ShouldBindUri(&req); err != nil {
		logger.Error(ctx, "Failed to bind salesperson email from URI")
		common.ValidationError(ctx, err)
		return
	}

	dashboardData, err := sh.saleService.GetSingleSalespersonDashboard(ctx, req.Email)
	if err != nil {
		logger.Error(ctx, "Error getting salesperson dashboard data", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}

	response := dto.NewSalespersonDashboardResponse(dashboardData)
	common.HandleSuccess(ctx, common.StatusOK, response)
}
