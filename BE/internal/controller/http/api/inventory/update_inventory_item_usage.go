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

func (ih *InventoryHandler) UpdateInventoryItemUsage(ctx *gin.Context) {
	logger.Info(ctx, "Update inventory item usage request received")

	var req dto.UpdateInventoryItemUsageRequest
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
		// OldUsageCount: req.OldUsageCount,
		// NewUsageCount: req.NewUsageCount,
	}

	actingClerkID := ctx.GetString("user_id")
	updateUsage, actorName, err := ih.inventoryService.UpdateInventoryItemUsage(ctx, usage, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Update item usage"},
		Description: fmt.Sprintf("%s update item %s usage", actorName, updateUsage.ItemCode),
	})
	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdateInventoryItemUsageResponse(updateUsage))
}
