package task

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/events"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (th *TaskHandler) DeleteTask(ctx *gin.Context) {
	logger.Info(ctx, "Delete task request received")
	var uri dto.DeleteTaskRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.TaskID)
	logger.Info(ctx, "Parsed UUID", zap.String("task-id", uri.TaskID), zap.Any("parsed-uuid", parsedUUID))
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var task domain.Task
	task.ID = parsedUUID
	deleteTask, err := th.taskService.DeleteTask(ctx, &task)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Task deleted"},
		Description: "Deleted a task ",
	})
	logger.Info(ctx, "Task deleted", zap.Any("task", deleteTask))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteTaskResponse(deleteTask))
	go th.bus.Publish("tasks", events.Event{
		Type: "task.deleted",
		Data: deleteTask,
	})
}
