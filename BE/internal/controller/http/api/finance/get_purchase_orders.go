package finance

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (fh *FinanceHandler) GetPurchaseOrders(ctx *gin.Context) {
	logger.Info(ctx, "Get sites request received")

	var searchParams dto.GetPurchaseOrderRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	getPurchaseOrders, totalPurchaseOrders, err := fh.financeService.GetPurchaseOrders(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting purchase orders", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Purchase Orders retrieved", zap.Any("PurchaseOrders", getPurchaseOrders))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetPurchaseOrderResponse(getPurchaseOrders, totalPurchaseOrders))
}
