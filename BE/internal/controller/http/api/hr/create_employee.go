package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (hh *HrHandler) CreateEmployee(c *gin.Context) {
	logger.Info(c, "Create employee request received")
	var req dto.CreateEmployeeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		logger.Error(c, "Failed to bind request", zap.Error(err))
		return
	}
	employee := mapper.EmployeeRequestToDomain(&req)
	actingClerkID := c.GetString("user_id")
	createdEmployee, actorName, err := hh.hrService.CreateEmployee(c, employee, actingClerkID)
	if err != nil {
		common.HandleError(c, err)
		logger.Error(c, "Failed to create employee", zap.Error(err))
		return
	}
	logger.Info(c, "Employee created", zap.Any("employee", createdEmployee))

	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Employee created"},
		Description: actorName + " added " + createdEmployee.FirstName + " " + createdEmployee.LastName + " to employee records",
	})
	common.HandleSuccess(c, common.StatusCreated, dto.NewCreateEmployeeResponse(createdEmployee))
	logger.Info(c, "Employee created successfully", zap.Any("employee", dto.NewCreateEmployeeResponse(createdEmployee)))
}
