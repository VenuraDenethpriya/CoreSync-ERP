package inventory

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

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

	var orderID, itemID, packID uuid.UUID
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

	if query.PackID != "" {
		packID, err = uuid.Parse(query.PackID)
		if err != nil {
			common.HandleError(ctx, fmt.Errorf("invalid pack_id UUID: %v", err))
			return
		}
	}

	usages, total, mode, err := ih.inventoryService.GetInventoryItemUsages(ctx, orderID, itemID, packID, query.Limit, query.Offset)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	response := dto.NewGetInventoryItemUsageGroupedListResponse(usages, total, mode)

	logger.Info(ctx, "Inventory item usages retrieved", zap.Int("count", len(response.Items)), zap.Int("total_groups", total))
	common.HandleSuccess(ctx, common.StatusAccepted, response)
}
