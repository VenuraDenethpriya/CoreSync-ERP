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

func (ih *InventoryHandler) UpdateInventoryItemAllocation(ctx *gin.Context) {
	logger.Info(ctx, "Update inventory item allocation request received")

	var req dto.UpdateInventoryItemAllocationRequest
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

	allocation := &domain.InventoryItemAllocate{
		ID:       idUUID,
		ItemID:   req.ItemID,
		OldCount: req.OldCount,
		Count:    req.Count,
	}
	actingClerkID := ctx.GetString("user_id")
	updateAllocate, actorName, err := ih.inventoryService.UpdateInventoryItemAllocation(ctx, allocation, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Update item allocation"},
		Description: fmt.Sprintf("%s update item %s allocation %s%s  %d  %d", actorName, updateAllocate.ItemCode, updateAllocate.OrderType, updateAllocate.OrderNo, updateAllocate.OldCount, updateAllocate.Count),
	})
	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdateInventoryItemAllocationResponse(updateAllocate))
}
