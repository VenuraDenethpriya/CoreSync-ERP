package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (hh *HrHandler) CreatePayroll(c *gin.Context) {
	logger.Info(c, "Create payroll request received")
	var req dto.CreatePayrollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		logger.Error(c, "Failed to bind request", zap.Error(err))
		return
	}
	payroll := mapper.PayrollRequestToDomain(&req)
	createdPayroll, err := hh.hrService.CreatePayroll(c, payroll)
	if err != nil {
		common.HandleError(c, err)
		logger.Error(c, "Failed to create payroll", zap.Error(err))
		return
	}
	logger.Info(c, "Payroll created", zap.Any("payroll", createdPayroll))

	userName := createdPayroll.CreatedBy
	if createdPayroll.User != nil {
		userName = createdPayroll.User.FirstName + " " + createdPayroll.User.LastName
	}
	employeeName := createdPayroll.EmployeeId.String()
	if createdPayroll.Employee != nil {
		employeeName = createdPayroll.Employee.FirstName + " " + createdPayroll.Employee.LastName
	}
	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Payroll created"},
		Description: userName + "added" + createdPayroll.Month + " month payroll record for" + employeeName,
	})
	common.HandleSuccess(c, common.StatusCreated, dto.GetCreatePayrollResponse(createdPayroll))
	logger.Info(c, "Payroll created successfully", zap.Any("payroll", dto.GetCreatePayrollResponse(createdPayroll)))
}
