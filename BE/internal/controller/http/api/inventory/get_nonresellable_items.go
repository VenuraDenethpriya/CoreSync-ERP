package inventory

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *InventoryHandler) GetNonResellableInventory(ctx *gin.Context) {
	logger.Info(ctx, "Get nonresellable inventory request received")

	var searchParams dto.GetNonResellableInventoryRequest
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}

	nonresellableInventories, err := ch.inventoryService.GetNonResellableInventory(ctx, searchParams.Query, searchParams.Limit)
	if err != nil {
		logger.Error(ctx, "Error getting inventory", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}

	logger.Info(ctx, "Inventory retrieved", zap.Int("count", len(nonresellableInventories)))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetNonReservableInventoryListResponse(nonresellableInventories))
}
