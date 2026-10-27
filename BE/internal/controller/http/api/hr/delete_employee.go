package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service/domain"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (hh *HrHandler) DeleteEmployee(ctx *gin.Context) {
	logger.Info(ctx, "Delete employee request received")
	var uri dto.DeleteEmployeeRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.EmployeeId)
	logger.Info(ctx, "Parsed UUID", zap.String("employee-id", uri.EmployeeId), zap.Any("parsed-uuid", parsedUUID))
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var employee domain.Employee
	employee.ID = parsedUUID
	actingClerkID := ctx.GetString("user_id")
	deleteEmployee, actorName, err := hh.hrService.DeleteEmployee(ctx, &employee, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Employee deleted"},
		Description: fmt.Sprintf("%s deleted an employee: %s %s", actorName, deleteEmployee.FirstName, deleteEmployee.LastName),
	})
	logger.Info(ctx, "Employee deleted", zap.Any("Employee", deleteEmployee))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteEmployeeResponse(deleteEmployee))

}
