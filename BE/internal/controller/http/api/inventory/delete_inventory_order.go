package inventory

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

func (ch *InventoryHandler) DeleteInventoryOrder(ctx *gin.Context) {
	logger.Info(ctx, "Delete inventory order request received")
	var uri dto.DeleteInventoryOrderIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}
	itemUUID, err := uuid.Parse(uri.OrderId)
	if err != nil {
		logger.Error(ctx, "Invalid UUID format", zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}
	var inventoryOrder domain.InventoryOrder
	inventoryOrder.ID = itemUUID

	actingClerkID := ctx.GetString("user_id")
	deleteInventoryOrder, actorName, err := ch.inventoryService.DeleteInventoryOrder(ctx, &inventoryOrder, actingClerkID)
	if err != nil {
		logger.Error(ctx, "Failed to delete inventory order", zap.Error(err))
		common.HandleError(ctx, err)
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Inventory order deleted"},
		Description: fmt.Sprintf("%s deleted a Inventory Order No %s", actorName, deleteInventoryOrder.OrderNo),
	})

	logger.Info(ctx, "Inventory order deleted", zap.Any("inventory order", deleteInventoryOrder))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteInventoryOrderResponse(deleteInventoryOrder))
}
