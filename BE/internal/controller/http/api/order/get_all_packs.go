package order

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *OrderHandler) GetAllPacks(ctx *gin.Context) {
	logger.Info(ctx, "Get all packs request recived")
	var searchParams dto.GetPacksRequest
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding packs parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	packs, totalPacks, err := ch.orderService.GetAllPacks(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error getting packs", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Packs fetched", zap.Any("packs", packs))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetPacksResponse(packs, totalPacks))
}
