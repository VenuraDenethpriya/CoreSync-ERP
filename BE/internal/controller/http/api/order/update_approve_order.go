package order

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/events"
	"rims-backend/internal/helper/logger"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (ch *OrderHandler) ApproveOrder(ctx *gin.Context) {
	logger.Info(ctx, "Approve order request received")
	var uri dto.UpdateOrderIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind URI", zap.Error(err))
		return
	}

	orderID, err := uuid.Parse(uri.OrderID)
	if err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Invalid order ID format", zap.Error(err))
		return
	}

	var req dto.ApproveOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	order := mapper.ApproveOrderRequestToDomain(&req)
	order.OrderID = orderID
	updateOrder, err := ch.orderService.UpdateOrderApproval(ctx.Request.Context(), order)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to update order", zap.Error(err))
		return
	}
	userName := updateOrder.CreatedBy
	if updateOrder.User != nil {
		userName = strings.TrimSpace(updateOrder.User.FirstName + " " + updateOrder.User.LastName)
	}
	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Order approved"},
		Description: fmt.Sprintf("%s approved a Order %s/%s", userName, updateOrder.Type, updateOrder.OrderNo),
	})
	common.HandleSuccess(ctx, common.StatusOK, dto.NewApproveOrderResponse(updateOrder))
	logger.Info(ctx, "Order updated successfully", zap.Any("order", updateOrder))
	go ch.bus.Publish("orders", events.Event{
		Type: "order.updated",
		Data: updateOrder,
	})
}
