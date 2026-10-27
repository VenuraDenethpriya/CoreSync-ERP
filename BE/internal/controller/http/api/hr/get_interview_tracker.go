package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (hr *HrHandler) GetInterviewTracker(ctx *gin.Context) {
	logger.Info(ctx, "Get interview tracker request received")

	var searchParams dto.GetInterviewTrackerRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	getInterviewTrackers, totalInterviewTracker, err := hr.hrService.GetInterviewTrackers(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting interview tracker", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Interview tracker retrieved", zap.Any("Interview tracker", getInterviewTrackers))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetInterviewTrackerResponse(getInterviewTrackers, totalInterviewTracker))
}
