package inventory

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (ih *InventoryHandler) UpdateInventoryItemRestockPrintStatus(ctx *gin.Context) {
	logger.Info(ctx, "Update inventory item restock print status request received")

	var req dto.UpdateInventoryItemRestockRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	restockID, err := uuid.Parse(req.ID)
	if err != nil {
		logger.Error(ctx, "Invalid restock ID format", zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}
	restock := mapper.UpdateInventoryItemRestockRequestToDomain(&req)
	restock.ID = restockID

	actingClerkID := ctx.GetString("user_id")
	updatedRestock, actorName, err := ih.inventoryService.UpdateInventoryItemRestockPrintStatus(ctx, restock, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to update inventory item restock print status", zap.Error(err))
		return
	}

	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Update inventory item restock print status"},
		Description: fmt.Sprintf("%s  print barcodes for %s", actorName, updatedRestock.ItemCode),
	})

	logger.Info(ctx, "Inventory item restock print status updated", zap.Any("restock", updatedRestock))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdateInventoryItemRestockResponse(updatedRestock))
}
