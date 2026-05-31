package inventory

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (ih *InventoryHandler) GetInventoryById(ctx *gin.Context) {
	logger.Info(ctx, "Get inventory by id request received")
	var uri dto.GetInventoryByIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	parsedID, err := uuid.Parse(uri.ItemID)
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var inventory domain.Inventory
	inventory.ID = parsedID
	getInventory, err := ih.inventoryService.GetInventoryById(ctx, &inventory)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.HandleSuccess(ctx, common.StatusAccepted, dto.NewGetInventoryByIdResponse(getInventory))
}
