package finance

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

func (fh *FinanceHandler) DeletePurchaseOrder(ctx *gin.Context) {
	logger.Info(ctx, "Delete purchase order request received")
	var uri dto.DeletePurchaseOrderRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.PurchaseOrderId)
	logger.Info(ctx, "Parsed UUID", zap.String("purchaseorder-id", uri.PurchaseOrderId), zap.Any("parsed-uuid", parsedUUID))
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var purchaseOrder domain.Finance
	purchaseOrder.ID = parsedUUID
	actingClerkID := ctx.GetString("user_id")
	deletePurchaseOrder, actorName, err := fh.financeService.DeletePurchaseOrder(ctx, &purchaseOrder, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Purchase order deleted"},
		Description: fmt.Sprintf("%s deleted a purchase order ", actorName),
	})
	logger.Info(ctx, "Purchase order deleted", zap.Any("site", deletePurchaseOrder))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeletePurchaseOrderResponse(deletePurchaseOrder))

}
