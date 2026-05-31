package order

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *OrderHandler) GetAllOrders(ctx *gin.Context) {
	logger.Info(ctx, "Get all orders request recived")

	var searchParams dto.GetOrdersRequest
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error parsing search params", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Order search params", zap.Any("order_search_params", searchParams))
	orders, totalOrders, err := ch.orderService.GetAllOrders(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset, searchParams.Vat, searchParams.OrderStatus, searchParams.PaymentStatus)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error getting orders", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Orders fetched", zap.Any("orders", orders))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetAllOrdersResponse(orders, totalOrders))
}
