package finance

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (fh *FinanceHandler) UpdatePurchaseOrder(ctx *gin.Context) {
	logger.Info(ctx, "Update purchase order request received")
	var req dto.UpdatePurchaseOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	purchaseOrder := mapper.UpdatePurchaseOrderRequestToDomain(&req)
	actingClerkID := ctx.GetString("user_id")
	updatePurchaseOrder, actorName, err := fh.financeService.UpdatePurchaseOrder(ctx, purchaseOrder, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Purchase order updated"},
		Description: fmt.Sprintf("%s updated a purchase order ", actorName),
	})
	logger.Info(ctx, "Purchase order updated successfully", zap.Any("purchaseOrderId", updatePurchaseOrder.ID))
	common.HandleSuccess(ctx, common.StatusAccepted, dto.NewUpdatePurchaseOrderResponse(updatePurchaseOrder))
}
