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

func (hh *HrHandler) UpdatePayrollHistory(ctx *gin.Context) {
	logger.Info(ctx, "Update payroll history request received")
	var req dto.UpdatePayrollRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	updatePayroll := mapper.UpdatePayrollRequestToDomain(&req)
	actingClerkID := ctx.GetString("user_id")
	updatePayroll, actorName, err := hh.hrService.UpdatePayroll(ctx, updatePayroll, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	employeeName := updatePayroll.EmployeeId.String()
	if updatePayroll.Employee != nil {
		employeeName = updatePayroll.Employee.FirstName + " " + updatePayroll.Employee.LastName
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Update payroll updated"},
		Description: fmt.Sprintf("%s update payroll for an employee: %s 's %s month", actorName, employeeName, updatePayroll.Month),
	})
	logger.Info(ctx, "Payroll history updated successfully", zap.Any("payroll history", updatePayroll.ID))
	common.HandleSuccess(ctx, common.StatusAccepted, dto.NewUpdatePayrollResponse(updatePayroll))
}
