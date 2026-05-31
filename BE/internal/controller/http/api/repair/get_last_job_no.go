package repair

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *RepairHandler) GetLastRepairNo(ctx *gin.Context) {
	logger.Info(ctx, "Get last repair no request received")
	repairNo, err := ch.repairService.GetLastRepairNo(ctx)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error getting last repair no", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Last repair no retrieved", zap.Any("repair_no", repairNo))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetLastRepairNoResponse(repairNo))
}
