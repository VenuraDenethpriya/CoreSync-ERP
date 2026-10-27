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

func (ih *InventoryHandler) DeleteInventoryItemUsage(ctx *gin.Context) {
	logger.Info(ctx, "Delete inventory item usage request received")

	var req dto.DeleteInventoryItemUsageRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	idUUID, err := uuid.Parse(req.ID)
	if err != nil {
		logger.Error(ctx, "Invalid ID format", zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}

	itemUUID, err := uuid.Parse(req.ItemID)
	if err != nil {
		logger.Error(ctx, "Invalid item ID format", zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}

	usage := &domain.InventoryItemUsage{
		ID:     idUUID,
		ItemID: itemUUID,
		// UsageCount: req.UsageCount,
	}
	actingClerkID := ctx.GetString("user_id")
	deletedUsage, actorName, err := ih.inventoryService.DeleteInventoryItemUsage(ctx, usage, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Item usage deleted"},
		Description: fmt.Sprintf("%s deleted Item %s usage for%s%s ", actorName, deletedUsage.ItemCode, deletedUsage.OrderType, deletedUsage.OrederNo),
	})
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteInventoryItemUsageResponse(deletedUsage))
}
