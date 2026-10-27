package order

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *OrderHandler) GetOrderPaymentList(c *gin.Context) {
	logger.Info(c, "Get order payment list request received")

	var searchParams dto.GetPaymentRequest

	if err := c.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(c, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(c, err)
		return
	}
	getPayments, totalPayments, err := h.orderService.GetOrderPaymentList(c, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(c, "Error getting order payment list", zap.Any("error", err))
		common.HandleError(c, err)
		return
	}
	logger.Info(c, "Order payment list retrieved", zap.Any("payments", getPayments))
	common.HandleSuccess(c, common.StatusOK, dto.NewGetOrderPaymentListResponses(getPayments, totalPayments))
}
