package salesperson

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (sh *SalepersonHandler) DeleteSalesperson(ctx *gin.Context) {
	logger.Info(ctx, "Delete salesperson request recived")

	var uri dto.DeleteSalespersonIDRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		logger.Error(ctx, "Error binding uri parameters", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.ID)
	logger.Info(ctx, "Parsed UUID", zap.String("salesperson-id", uri.ID), zap.Any("parsed-uuid", parsedUUID))
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var salesperson domain.Salesperson
	salesperson.ID = parsedUUID
	actingClerkID := ctx.GetString("user_id")
	deleteSalesperson, actorName, err := sh.saleService.DeleteSalesperson(ctx, &salesperson, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Salesperson deleted"},
		Description: fmt.Sprintf("%s deleted a Salesperson %s", actorName, &deleteSalesperson.FirstName, &deleteSalesperson.LastName),
	})
	logger.Info(ctx, "Sale deleted", zap.Any("sale", deleteSalesperson))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteSalespersonResponse(deleteSalesperson))
}
