package inventory

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *InventoryHandler) GetInventoryOrders(ctx *gin.Context) {
	logger.Info(ctx, "Get inventory order request received")

	var searchParams dto.GetInventoryOrdersRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	inventoryOrders, totalInventoryOrders, err := ch.inventoryService.GetInventoryOrders(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting inventory order", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Inventory orders retrieved", zap.Int("count", len(inventoryOrders)))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetAllInventoryOrdersResponse(inventoryOrders, totalInventoryOrders))
}
