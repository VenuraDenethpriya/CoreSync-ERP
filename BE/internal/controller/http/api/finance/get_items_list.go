package finance

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (fh *FinanceHandler) GetPurchaseItems(ctx *gin.Context) {
	logger.Info(ctx, "Get items list request received")

	var searchParams dto.GetItemRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	getItems, totalItems, err := fh.financeService.GetPurchaseItems(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting items", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Items retrieved", zap.Any("Itmes", getItems))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetItemsResponse(getItems, totalItems))
}
