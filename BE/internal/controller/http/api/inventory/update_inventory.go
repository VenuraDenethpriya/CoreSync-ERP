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

func (ch *InventoryHandler) UpdateInventory(ctx *gin.Context) {
	logger.Info(ctx, "Update inventory request received")
	var req dto.UpdateInventoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	inventory := mapper.UpdateInventoryRequestToDomain(&req)
	actingClerkID := ctx.GetString("user_id")
	updateInventory, actorName, err := ch.inventoryService.UpdateInventory(ctx, inventory, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to update inventory", zap.Error(err))
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Update item"},
		Description: fmt.Sprintf("%s update item %s", actorName, updateInventory.ItemCode),
	})
	logger.Info(ctx, "Inventory updated", zap.Any("inventory", updateInventory))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdateInventoryResponse(updateInventory))
}
