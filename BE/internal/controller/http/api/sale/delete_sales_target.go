package sale

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

func (sh *SaleHandler) DeleteSalesTarget(ctx *gin.Context) {
	logger.Info(ctx, "Delete sales target request recived")

	var uri dto.DeleteSalesTargetIDRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		logger.Error(ctx, "Error binding uri parameters", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.ID)
	logger.Info(ctx, "Parsed UUID", zap.String("sales-target-id", uri.ID), zap.Any("parsed-uuid", parsedUUID))
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var salesTarget domain.SalesTarget
	salesTarget.ID = parsedUUID
	actingClerkID := ctx.GetString("user_id")
	deleteSalesTarget, actorName, err := sh.saleService.DeleteSalesTarget(ctx, &salesTarget, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Sales target deleted"},
		Description: fmt.Sprintf("%s deleted a Sales target", actorName),
	})
	logger.Info(ctx, "Sales target deleted", zap.Any("sales target", deleteSalesTarget))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteSalesTargetResponse(deleteSalesTarget))
}
