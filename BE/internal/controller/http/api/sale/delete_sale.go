package sale

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

func (sh *SaleHandler) DeleteSale(ctx *gin.Context) {
	logger.Info(ctx, "Delete sale request recived")

	var uri dto.DeleteSaleIDRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		logger.Error(ctx, "Error binding uri parameters", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.ID)
	logger.Info(ctx, "Parsed UUID", zap.String("sale-id", uri.ID), zap.Any("parsed-uuid", parsedUUID))
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var sale domain.Sale
	sale.SalesID = parsedUUID
	actingClerkID := ctx.GetString("user_id")
	deleteSale, actorName, err := sh.saleService.DeleteSale(ctx, &sale, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Sale deleted"},
		Description: fmt.Sprintf("%s deleted a Sale for %s", actorName, deleteSale.CustomerName),
	})
	logger.Info(ctx, "Sale deleted", zap.Any("sale", deleteSale))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteSaleResponse(deleteSale))
}
