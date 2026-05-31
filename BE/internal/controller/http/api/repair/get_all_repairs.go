package repair

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *RepairHandler) GetRepairs(ctx *gin.Context) {
	logger.Info(ctx, "Get repairs request received")

	var searchParams dto.GetRepairsRequest
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}
	getRepairs, totalRepairs, err := h.repairService.GetRepairs(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting repairs", zap.Error(err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Repairs retrieved", zap.Any("repairs", getRepairs))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetRepairsResponse(getRepairs, totalRepairs))
}
