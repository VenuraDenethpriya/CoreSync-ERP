package inventory

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

func (ch *InventoryHandler) DeleteInventory(ctx *gin.Context) {
	logger.Info(ctx, "Delete inventory request received")
	var uri dto.DeleteInventoryIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}
	itemUUID, err := uuid.Parse(uri.ItemID)
	if err != nil {
		logger.Error(ctx, "Invalid UUID format", zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}
	var inventory domain.Inventory
	inventory.ID = itemUUID

	actingClerkID := ctx.GetString("user_id")
	deleteInventory, actorName, err := ch.inventoryService.DeleteInventory(ctx, &inventory, actingClerkID)
	if err != nil {
		logger.Error(ctx, "Failed to delete inventory", zap.Error(err))
		common.HandleError(ctx, err)
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Item deleted"},
		Description: fmt.Sprintf("%s deleted a Item %s", actorName, deleteInventory.ItemCode),
	})

	logger.Info(ctx, "Inventory deleted", zap.Any("inventory", deleteInventory))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteInventoryResponse(deleteInventory))
}
