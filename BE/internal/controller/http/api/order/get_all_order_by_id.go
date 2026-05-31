package order

import (
	"errors"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (ch *OrderHandler) GetOrderById(ctx *gin.Context) {
	logger.Info(ctx, "Get all order by id request recived")
	var uri dto.GetOrderIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	orderUUID, err := uuid.Parse(uri.OrderID)
	if err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Invalid order ID format", zap.Error(err))
		return
	}
	var order domain.Order
	order.OrderID = orderUUID
	getOrder, err := ch.orderService.GetOrderById(ctx, &order)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to get order by id", zap.Error(err))
		return
	}
	if getOrder == nil {
		common.HandleError(ctx, errors.New("order not found"))
		return
	}
	logger.Info(ctx, "Order by id fetched", zap.Any("order", getOrder))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetOrderByIdResponse(getOrder))
}
