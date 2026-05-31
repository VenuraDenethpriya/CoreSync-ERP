package order

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *OrderHandler) GetLastOrderType(ctx *gin.Context) {
	logger.Info(ctx, "Get last order type request received")
	orderTypes, err := ch.orderService.GetLastOrderType(ctx)
	if err != nil {
		logger.Error(ctx, "Error getting last order type", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}

	logger.Info(ctx, "Last order type retrieved", zap.Any("order_types", orderTypes))
	response := &dto.GetLastOrderTypeResponse{
		OrderNumbers: orderTypes,
	}
	common.HandleSuccess(ctx, common.StatusOK, response)
}
