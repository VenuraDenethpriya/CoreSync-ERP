package production

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *ProductionHandler) GetCasings(ctx *gin.Context) {
	logger.Info(ctx, "Get all casings request recived")
	var searchParams dto.GetCasingRequest
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding casing parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	casings, totalCasing, err := h.productionService.GetCasings(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error getting casings", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Casings fetched", zap.Any("casings", casings))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetCasingListResponse(casings, totalCasing))
}
