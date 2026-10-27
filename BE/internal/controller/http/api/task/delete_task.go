package task

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/events"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service/domain"
	"fmt"

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

	actingClerkID := ctx.GetString("user_id")
	deleteTask, actorName, err := th.taskService.DeleteTask(ctx, &task, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Task deleted"},
		Description: fmt.Sprintf("%s deleted a task", actorName),
	})
	logger.Info(ctx, "Task deleted", zap.Any("task", deleteTask))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteTaskResponse(deleteTask))
	go th.bus.Publish("tasks", events.Event{
		Type: "task.deleted",
		Data: deleteTask,
	})
}
