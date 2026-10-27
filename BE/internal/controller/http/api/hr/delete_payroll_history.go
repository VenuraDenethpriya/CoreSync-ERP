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

func (hh *HrHandler) DeletePayrollHistory(ctx *gin.Context) {
	logger.Info(ctx, "Delete payroll history request received")
	var uri dto.DeletePayrollHistoryRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.PayrollId)
	logger.Info(ctx, "Parsed UUID", zap.String("payroll-id", uri.PayrollId), zap.Any("parsed-uuid", parsedUUID))
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var payroll domain.Payroll
	payroll.ID = parsedUUID
	actingClerkID := ctx.GetString("user_id")
	deletePayrollHistory, actorName, err := hh.hrService.DeletePayrollHistory(ctx, &payroll, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Payroll history deleted"},
		Description: fmt.Sprintf("%s deleted %s payroll history for employee: %s %s", actorName, deletePayrollHistory.Month, deletePayrollHistory.Employee.FirstName, deletePayrollHistory.Employee.LastName),
	})
	logger.Info(ctx, "Payroll history deleted", zap.Any("PayrollHistory", deletePayrollHistory))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeletePayrollHistoryResponse(deletePayrollHistory))

}
