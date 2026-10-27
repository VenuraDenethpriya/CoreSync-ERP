package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (hr *HrHandler) GetPayrollEmployeeList(ctx *gin.Context) {
	logger.Info(ctx, "Get payroll employee list request received")

	var searchParams dto.GetPayrollEmployeeListRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	getPayrollEmployeeList, totalPayrollEmployeeLists, err := hr.hrService.GetPayrollEmployeeList(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset, searchParams.SalaryCycle)
	if err != nil {
		logger.Error(ctx, "Error getting payroll employee list requests", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Get payroll employee list retrieved", zap.Any("Payroll employee list request", getPayrollEmployeeList))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetPayrollEmployeeListResponse(getPayrollEmployeeList, totalPayrollEmployeeLists))
}
