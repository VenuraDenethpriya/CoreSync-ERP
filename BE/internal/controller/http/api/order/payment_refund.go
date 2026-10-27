package order

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (oh *OrderHandler) PaymentRefund(ctx *gin.Context) {
	logger.Info(ctx, "Payment Refund request received")

	var req dto.UpdateOrderPaymentRefundRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Fail to bind request", zap.Error(err))
		return
	}

	actingClerkID := ctx.GetString("user_id")
	// Update order status
	order := mapper.UpdateOrderPaymentRefundRequestOrderToDomain(&req)
	updateOrderStatus, _, err := oh.orderService.UpdateOrderStatus(ctx, order, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Order status updated", zap.Any("order", updateOrderStatus))

	// Update ALL payments
	payments := mapper.UpdateOrderPaymentRefundRequestPaymentsToDomain(&req)
	for _, payment := range payments {
		UpdatePaymentType, actorName, err := oh.orderService.UpdatePaymentType(ctx, payment, actingClerkID)
		if err != nil {
			common.HandleError(ctx, err)
			logger.Error(ctx, "Failed to update order payment type", zap.Error(err))
			return
		}
		// Helper function to set audit info
		common.SetAuditInfo(ctx, common.AuditLogDetails{
			Headers:     map[string]string{"X-Response-Message": "Payment refund"},
			Description: fmt.Sprintf("%s refund payment for %s %s", actorName, UpdatePaymentType.Order.Type, UpdatePaymentType.Order.OrderNo),
		})
		logger.Info(ctx, "Order payment type changed", zap.Any("payment", payment))
	}

	common.HandleSuccess(ctx, common.StatusCreated, dto.NewOrderPaymentRefundResponse(updateOrderStatus))
}
