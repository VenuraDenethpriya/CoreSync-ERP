package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (hr *HrHandler) GetPayrollHistory(ctx *gin.Context) {
	logger.Info(ctx, "Get payroll history list request received")

	var searchParams dto.GetPayrollHistoryRequest

	var parsedEmployeeID uuid.UUID
	if searchParams.EmployeeID != "" {
		var err error
		parsedEmployeeID, err = uuid.Parse(searchParams.EmployeeID)
		if err != nil {
			parsedEmployeeID = uuid.Nil
		}
	}
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	getPayrollHistoryList, totalPayrollHistoryLists, err := hr.hrService.GetPayrollHistoryList(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset, searchParams.SalaryCycle, parsedEmployeeID, searchParams.Month)
	if err != nil {
		logger.Error(ctx, "Error getting payroll history list requests", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Get payroll history list retrieved", zap.Any("Payroll history list request", getPayrollHistoryList))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetPayrollHistoryListResponse(getPayrollHistoryList, totalPayrollHistoryLists))
}
