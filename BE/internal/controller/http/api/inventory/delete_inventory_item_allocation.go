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

func (ih *InventoryHandler) DeleteInventoryItemAllocation(ctx *gin.Context) {
	logger.Info(ctx, "Delete inventory item allocation request received")

	var req dto.DeleteInventoryItemAllocationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	idUUID, err := uuid.Parse(req.ID)
	logger.Info(ctx, "Delete inventory item allocation", zap.String("id", idUUID.String()))
	if err != nil {
		logger.Error(ctx, "Invalid ID format", zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}

	allocation := &domain.InventoryItemAllocate{
		ID:     idUUID,
		ItemID: req.ItemID,
		Count:  req.Count,
	}
	actingClerkID := ctx.GetString("user_id")
	deleteAllocation, actorName, err := ih.inventoryService.DeleteInventoryItemAllocation(ctx, allocation, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Item allocation deleted"},
		Description: fmt.Sprintf("%s deleted a Item %s allocation from order %s%s", actorName, deleteAllocation.ItemCode, deleteAllocation.OrderType, deleteAllocation.OrderNo),
	})
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteInventoryItemAllocationResponse(deleteAllocation))
}
