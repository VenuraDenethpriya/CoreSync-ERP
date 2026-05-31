package order

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"

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

	// Update order status
	order := mapper.UpdateOrderPaymentRefundRequestOrderToDomain(&req)
	updateOrderStatus, err := oh.orderService.UpdateOrderStatus(ctx, order)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Order status updated", zap.Any("order", updateOrderStatus))

	actingClerkID := ctx.GetString("user_id")
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
