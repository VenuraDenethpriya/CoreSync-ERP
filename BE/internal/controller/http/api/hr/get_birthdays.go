package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (hr *HrHandler) GetBirthdays(ctx *gin.Context) {
	logger.Info(ctx, "Get birthdays request received")

	var searchParams dto.GetBirthdaysRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	getBirthdays, totalBirthdays, err := hr.hrService.GetBirthdays(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting birthdays", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Birthdays retrieved", zap.Any("Birthdays", getBirthdays))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetBirthdaysResponse(getBirthdays, totalBirthdays))
}
