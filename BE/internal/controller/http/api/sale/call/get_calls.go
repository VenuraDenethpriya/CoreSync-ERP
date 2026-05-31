package call

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (c *CallHandler) GetCalls(ctx *gin.Context) {
	logger.Info(ctx, "Get calls request received")

	var searchParams dto.GetCallRequest
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	calls, totalCalls, err := c.saleService.GetCalls(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting calls", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Calls retrieved", zap.Int("count", len(calls)))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetCallsResponses(calls, totalCalls))
}
