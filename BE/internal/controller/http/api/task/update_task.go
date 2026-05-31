package task

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/events"
	"rims-backend/internal/helper/logger"

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
	updateTask, err := th.taskService.UpdateTask(ctx, task)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Task updated"},
		Description: "Updated a task",
	})
	logger.Info(ctx, "Task updated successfully", zap.Any("task-id", updateTask.ID))
	common.HandleSuccess(ctx, common.StatusAccepted, dto.NewUpdateTaskResponse(updateTask))
	go th.bus.Publish("tasks", events.Event{
		Type: "task.updated",
		Data: updateTask,
	})
}
