package task

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (th *TaskHandler) GetCardTasks(ctx *gin.Context) {
	logger.Info(ctx, "Get all task card request recived")
	var searchParams dto.GetTaskRequest
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error parsing search params", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Task search", zap.Any("order_search_params", searchParams))
	tasks, err := th.taskService.GetCardTasks(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error getting tasks", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Tasks fetched", zap.Any("tasks", tasks))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetTaskCardListResponse(tasks))
}
