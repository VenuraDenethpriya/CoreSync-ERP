package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (hr *HrHandler) GetTalentPool(ctx *gin.Context) {
	logger.Info(ctx, "Get talent pool request received")

	var searchParams dto.GetTalentPoolRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	getTalentPools, totalTalentPools, err := hr.hrService.GetTalentPools(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting talent pool", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Talent pool retrieved", zap.Any("Talent pool", getTalentPools))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetTalentPoolsResponse(getTalentPools, totalTalentPools))
}
