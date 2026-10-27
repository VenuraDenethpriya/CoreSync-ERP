package order

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/events"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (ch *OrderHandler) DeleteOrder(ctx *gin.Context) {
	logger.Info(ctx, "Delete order request received")

	// Bind and validate URI param
	var uri dto.DeleteOrderIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		logger.Error(ctx, "Failed to bind URI param", zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}

	// Parse order ID
	orderUUID, err := uuid.Parse(uri.OrderID)
	if err != nil {
		logger.Error(ctx, "Invalid UUID format", zap.Error(err))
		common.HandleError(ctx, err)
		return
	}

	actingClerkID := ctx.GetString("user_id")
	// Call service to delete order and its items
	deletedOrder, actorName, err := ch.orderService.DeleteOrder(ctx, orderUUID, actingClerkID)
	if err != nil {
		logger.Error(ctx, "Failed to delete order and items", zap.Error(err))
		common.HandleError(ctx, err)
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Order deleted"},
		Description: fmt.Sprintf("%s deleted a Order %s/%s", actorName, deletedOrder.Type, deletedOrder.OrderNo),
	})

	logger.Info(ctx, "Order and associated items deleted successfully", zap.String("order_id", deletedOrder.OrderID.String()))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteOrderResponse(deletedOrder))
	go ch.bus.Publish("orders", events.Event{
		Type: "order.deleted",
		Data: deletedOrder,
	})
}
