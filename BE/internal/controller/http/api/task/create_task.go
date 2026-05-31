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

func (h *TaskHandler) CreateTask(c *gin.Context) {
	logger.Info(c, "Create task request received")
	var req dto.CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		logger.Error(c, "Failed to bind request", zap.Error(err))
		return
	}
	task := mapper.CreateTaskRequestToDomain(&req)
	createdTask, err := h.taskService.CreateTask(c, task)
	if err != nil {
		common.HandleError(c, err)
		logger.Error(c, "Failed to create task", zap.Error(err))
		return
	}
	logger.Info(c, "Task created", zap.Any("task", createdTask))
	userName := createdTask.Assignee
	if createdTask.User != nil {
		userName = createdTask.User.FirstName + " " + createdTask.User.LastName
	}
	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Task created"},
		Description: userName + "Task " + createdTask.Task + " created",
	})
	common.HandleSuccess(c, common.StatusCreated, dto.NewCreateTaskResponse(createdTask))
	logger.Info(c, "Task created successfully", zap.Any("task", dto.NewCreateTaskResponse(createdTask)))
	go h.bus.Publish("tasks", events.Event{
		Type: "task.created",
		Data: createdTask,
	})
}
