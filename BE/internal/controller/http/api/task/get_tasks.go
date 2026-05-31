package task

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (th *TaskHandler) GetTasks(ctx *gin.Context) {
	logger.Info(ctx, "Get tasks request received")

	var searchParams dto.GetTaskRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	getTasks, totalTasks, err := th.taskService.GetTasks(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting tasks", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Tasks retrieved", zap.Any("tasks", getTasks))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetTaskResponse(getTasks, totalTasks))
}
