package production

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *ProductionHandler) GetWireHarness(ctx *gin.Context) {
	logger.Info(ctx, "Get all wire harness request recived")
	var searchParams dto.GetWireHarnessRequest
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding wire harness parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	wireHarness, totalWireHarness, err := h.productionService.GetWireHarness(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error getting wire harness", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Wire harness fetched", zap.Any("casings", wireHarness))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetWireHarnessListResponse(wireHarness, totalWireHarness))
}
