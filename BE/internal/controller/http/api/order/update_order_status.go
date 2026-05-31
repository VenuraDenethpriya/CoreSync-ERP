package order

import (
	"context"
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/events"
	"rims-backend/internal/helper/logger"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *OrderHandler) UpdateOrderStatus(ctx *gin.Context) {
	logger.Info(ctx, "Update order status request received")
	var req dto.UpdateOrderStatusRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	order := mapper.UpdateOrderStatusUpdateToDomain(&req)
	updatedOrder, err := ch.orderService.UpdateOrderStatus(ctx, order)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to update order status", zap.Error(err))
		return
	}
	userName := updatedOrder.CreatedBy
	if updatedOrder.User != nil {
		userName = strings.TrimSpace(updatedOrder.User.FirstName + " " + updatedOrder.User.LastName)
	}
	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Order status updated"},
		Description: fmt.Sprintf("%s update order status %s/%s", userName, updatedOrder.Type, updatedOrder.OrderNo),
	})

	logger.Info(ctx, "Order status updated", zap.Any("order", updatedOrder))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdateOrderResponse(updatedOrder))

	if updatedOrder.OrderStatus == "Completed" {
		go func() {
			if ch.smsService != nil && updatedOrder.Customer != nil && updatedOrder.Customer.PhoneNo1 != "" {
				message := fmt.Sprintf(
					"Great news! Your order %s%s is now complete. Thank you for choosing Renewaa – powering your future, your way.",
					updatedOrder.Type,
					updatedOrder.OrderNo,
				)

				err := ch.smsService.SendSMS(context.Background(), updatedOrder.Customer.PhoneNo1, message)
				if err != nil {
					logger.Error(context.Background(), "Failed to send order completion SMS",
						zap.Error(err),
						zap.String("order_id", updatedOrder.OrderID.String()),
						zap.String("customer_phone", updatedOrder.Customer.PhoneNo1),
					)
				} else {
					logger.Info(context.Background(), "Order completion SMS sent successfully",
						zap.String("order_id", updatedOrder.OrderID.String()),
					)
				}
			}
		}()
	}
	go ch.bus.Publish("orders", events.Event{
		Type: "order.updated",
		Data: updatedOrder,
	})
}
