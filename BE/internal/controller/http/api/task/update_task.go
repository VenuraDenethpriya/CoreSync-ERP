package task

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/events"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (th *TaskHandler) UpdateTask(ctx *gin.Context) {
	logger.Info(ctx, "Update task request received")
	var req dto.UpdateTaskRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	task := mapper.UpdateTaskRequestToDomain(&req)

	actingClerkID := ctx.GetString("user_id")
	updateTask, actorName, err := th.taskService.UpdateTask(ctx, task, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Task updated"},
		Description: fmt.Sprintf("%s updated a task", actorName),
	})
	logger.Info(ctx, "Task updated successfully", zap.Any("task-id", updateTask.ID))
	common.HandleSuccess(ctx, common.StatusAccepted, dto.NewUpdateTaskResponse(updateTask))
	go th.bus.Publish("tasks", events.Event{
		Type: "task.updated",
		Data: updateTask,
	})
}
