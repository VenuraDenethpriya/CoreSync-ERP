package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (hh *HrHandler) UpdateEmployee(ctx *gin.Context) {
	logger.Info(ctx, "Update employee request received")
	var req dto.UpdateEmployeeRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	updateEmployee := mapper.UpdateEmployeeRequestToDomain(&req)
	actingClerkID := ctx.GetString("user_id")
	updateEmployee, actorName, err := hh.hrService.UpdateEmployee(ctx, updateEmployee, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Employee updated"},
		Description: fmt.Sprintf("%s update an employee. Member name: %s", actorName, updateEmployee.FirstName+" "+updateEmployee.LastName),
	})
	logger.Info(ctx, "Employee updated successfully", zap.Any("employeeId", updateEmployee.ID))
	common.HandleSuccess(ctx, common.StatusAccepted, dto.NewUpdateEmployeeResponse(updateEmployee))
}
