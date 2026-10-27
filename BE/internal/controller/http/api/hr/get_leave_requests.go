package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (hr *HrHandler) GetLeaveRequests(ctx *gin.Context) {
	logger.Info(ctx, "Get leave request received")

	var searchParams dto.GetLeaveRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	getLeaveRequests, totalLeaveRequests, err := hr.hrService.GetLeaveRequests(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting leave requests", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Leave requests retrieved", zap.Any("Leave request", getLeaveRequests))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetLeaveRequestResponse(getLeaveRequests, totalLeaveRequests))
}
