package inventory

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (ih *InventoryHandler) GetInventoryItemRestock(c *gin.Context) {
	var uriParams dto.GetInventoryItemRestockRequest
	if err := c.ShouldBindUri(&uriParams); err != nil {
		common.ValidationError(c, err)
		logger.Error(c, "Failed to bind URI parameters", zap.Error(err))
		return
	}

	var request dto.GetInventoryItemRestockRequest
	if err := c.ShouldBindUri(&request); err != nil {
		common.ValidationError(c, err)
		logger.Error(c, "Failed to bind item-id from URI", zap.Error(err))
		return
	}

	if err := c.ShouldBindQuery(&request); err != nil {
		logger.Error(c, "Failed to bind query parameters", zap.Error(err))
		common.ValidationError(c, err)
		return
	}

	passedItemID, err := uuid.Parse(request.ItemID)
	if err != nil {
		common.HandleError(c, err)
		logger.Error(c, "Failed to parse item id", zap.Error(err))
		return
	}
	restock, total, err := ih.inventoryService.GetInventoryItemRestock(c, passedItemID, request.Limit, request.Offset)
	if err != nil {
		common.HandleError(c, err)
		logger.Error(c, "Failed to get inventory item restock", zap.Error(err))
		return
	}
	common.HandleSuccess(c, common.StatusAccepted, dto.NewGetInventoryItemRestockListResponse(restock, total))
}
