package inventory

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *InventoryHandler) UpdateInventoryOrder(ctx *gin.Context) {
	logger.Info(ctx, "Update inventory order request received")
	var req dto.UpdateInventoryOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	inventoryOrder := mapper.UpdateInventoryOrderRequestToDomain(&req)
	actingClerkID := ctx.GetString("user_id")
	updateInventory, actorName, err := ch.inventoryService.UpdateInventoryOrder(ctx, inventoryOrder, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to update inventory order", zap.Error(err))
		return
	}

	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Update inventory order"},
		Description: fmt.Sprintf("%s update inventory order %s", actorName, updateInventory.OrderNo),
	})
	logger.Info(ctx, "Inventory order updated", zap.Any("inventory order", updateInventory))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdateInventoryOrderResponse(updateInventory))
}
