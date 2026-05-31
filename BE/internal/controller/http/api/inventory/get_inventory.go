package inventory

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *InventoryHandler) GetInventory(ctx *gin.Context) {
	logger.Info(ctx, "Get inventory request received")

	var searchParams dto.GetInventoryRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	inventories, totalInventory, err := ch.inventoryService.GetInventory(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting inventory", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Inventory retrieved", zap.Int("count", len(inventories)))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetAllInventoryResponse(inventories, totalInventory))
}
