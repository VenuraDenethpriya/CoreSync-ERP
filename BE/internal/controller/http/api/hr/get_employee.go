package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (hr *HrHandler) GetEmployee(ctx *gin.Context) {
	logger.Info(ctx, "Get employee request received")

	var searchParams dto.GetEmployeeRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	getEmployees, totalEmployees, err := hr.hrService.GetEmployees(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting employee", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Employee retrieved", zap.Any("Employee", getEmployees))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetEmployeeResponse(getEmployees, totalEmployees))
}
