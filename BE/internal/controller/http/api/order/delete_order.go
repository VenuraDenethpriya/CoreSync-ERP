package order

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/events"
	"rims-backend/internal/helper/logger"
	"strings"

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

	// Call service to delete order and its items
	deletedOrder, err := ch.orderService.DeleteOrder(ctx, orderUUID)
	if err != nil {
		logger.Error(ctx, "Failed to delete order and items", zap.Error(err))
		common.HandleError(ctx, err)
		return
	}

	userName := deletedOrder.CreatedBy
	if deletedOrder.User != nil {
		userName = strings.TrimSpace(deletedOrder.User.FirstName + " " + deletedOrder.User.LastName)
	}
	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Order deleted"},
		Description: fmt.Sprintf("%s deleted a Order %s/%s", userName, deletedOrder.Type, deletedOrder.OrderNo),
	})

	logger.Info(ctx, "Order and associated items deleted successfully", zap.String("order_id", deletedOrder.OrderID.String()))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteOrderResponse(deletedOrder))
	go ch.bus.Publish("orders", events.Event{
		Type: "order.deleted",
		Data: deletedOrder,
	})
}
