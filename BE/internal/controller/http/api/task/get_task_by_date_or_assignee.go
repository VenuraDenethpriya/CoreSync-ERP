package task

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *TaskHandler) GetTaskByDateOrAssignee(c *gin.Context) {
	var req dto.GetTaskByDateRanageOrAssigneeRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		logger.Error(c, "Failed to bind task request")
		common.ValidationError(c, err)
		return
	}

	tasks, err := h.taskService.GetTaskByDateOrAssignee(c, req.StartDate, req.EndDate, req.Assignee)
	if err != nil {
		logger.Error(c, "Failed to get task by date or assignee")
		common.HandleError(c, err)
		return
	}
	taskResponses := make([]*dto.TaskResponse, len(tasks))
	for i, task := range tasks {
		taskResponses[i] = dto.NewTaskResponse(task)
	}

	common.HandleSuccess(c, common.StatusOK, taskResponses)
	logger.Info(c, "Task by date "+req.StartDate.String()+" to "+req.EndDate.String()+" or assignee "+req.Assignee, zap.Any("tasks", taskResponses))
}
