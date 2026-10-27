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

func (ih *InventoryHandler) GetInventoryItemAllocation(c *gin.Context) {
	logger.Info(c, "Get inventory item allocation request received")
	var query dto.GetInventoryItemAllocationQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		common.ValidationError(c, err)
		return
	}
	var orderID, itemID, packID uuid.UUID
	var err error

	if query.OrderID != "" {
		orderID, err = uuid.Parse(query.OrderID)
		if err != nil {
			common.HandleError(c, fmt.Errorf("invalid order_id UUID: %v", err))
			return
		}
	}

	if query.ItemID != "" {
		itemID, err = uuid.Parse(query.ItemID)
		if err != nil {
			common.HandleError(c, fmt.Errorf("invalid item_id UUID: %v", err))
			return
		}
	}
	if query.PackID != "" {
		packID, err = uuid.Parse(query.PackID)
		if err != nil {
			common.HandleError(c, fmt.Errorf("invalid pack_id UUID: %v", err))
			return
		}
	}
	allocation, total, err := ih.inventoryService.GetInventoryItemAllocation(c, orderID, itemID, packID, query.Limit, query.Offset)
	if err != nil {
		common.HandleError(c, err)
		return
	}

	logger.Info(c, "Inventory item allocation retrieved", zap.Any("usages", allocation))
	common.HandleSuccess(c, common.StatusAccepted, dto.NewGetInventoryItemAllocationListResponse(allocation, total))
}
