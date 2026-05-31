package inventory

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (ih *InventoryHandler) GetInventoryItemUsage(ctx *gin.Context) {
	logger.Info(ctx, "Get inventory item usage request received")

	var query dto.GetInventoryItemUsageQuery
	if err := ctx.ShouldBindQuery(&query); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	var orderID, itemID uuid.UUID
	var err error

	if query.OrderID != "" {
		orderID, err = uuid.Parse(query.OrderID)
		if err != nil {
			common.HandleError(ctx, fmt.Errorf("invalid order_id UUID: %v", err))
			return
		}
	}

	if query.ItemID != "" {
		itemID, err = uuid.Parse(query.ItemID)
		if err != nil {
			common.HandleError(ctx, fmt.Errorf("invalid item_id UUID: %v", err))
			return
		}
	}

	usages, total, mode, err := ih.inventoryService.GetInventoryItemUsages(ctx, orderID, itemID, query.Limit, query.Offset)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	response := dto.NewGetInventoryItemUsageGroupedListResponse(usages, total, mode)

	logger.Info(ctx, "Inventory item usages retrieved", zap.Int("count", len(response.Items)), zap.Int("total_groups", total))
	common.HandleSuccess(ctx, common.StatusAccepted, response)
}
