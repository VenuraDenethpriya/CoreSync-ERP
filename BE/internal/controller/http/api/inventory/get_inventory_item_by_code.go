package inventory

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"

	"github.com/gin-gonic/gin"
)

func (ih *InventoryHandler) GetInventoryItemByCode(ctx *gin.Context) {
	logger.Info(ctx, "Get inventory by id request received")
	var uri dto.GetInventoryItemByCodeRequest
	if err := ctx.ShouldBindQuery(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	var inventory_item domain.InventoryItem
	inventory_item.ItemCode = uri.Query
	getInventoryItem, err := ih.inventoryService.GetInventoryItemByCode(ctx, &inventory_item)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.HandleSuccess(ctx, common.StatusAccepted, dto.NewGetInventoryItemByCodeResponse(getInventoryItem))
}
