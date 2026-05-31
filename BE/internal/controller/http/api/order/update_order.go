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

func (ch *OrderHandler) UpdateOrder(ctx *gin.Context) {
	logger.Info(ctx, "Update order request received")
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

	var req dto.UpdateOrderFullRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	customer := mapper.UpdateCustomerRequestToDomain(&req.Customer)
	order := mapper.UpdateOrderRequestToDomain(&req.Order)
	orderItems := mapper.UpdateOrderItemsRequestToDomain(&req.Items)
	payments := mapper.UpdateOrderPaymentsRequestToDomain(&req.Payments)

	actingClerkID := ctx.GetString("user_id")
	updateCustomer, actorName, err := ch.customerService.UpdateCustomer(ctx.Request.Context(), customer, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to update customer", zap.Error(err))
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Customer updated"},
		Description: fmt.Sprintf("%s update a  customer %s %s", actorName, updateCustomer.FirstName, updateCustomer.LastName),
	})
	logger.Info(ctx, "Customer updated", zap.Any("customer", updateCustomer))
	order.CustomerID = updateCustomer.CustomerID
	order.OrderID = orderID

	updateOrder, err := ch.orderService.UpdateOrder(ctx.Request.Context(), order)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to update order", zap.Error(err))
		return
	}
	logger.Info(ctx, "Order updated", zap.Any("order", updateOrder))

	existingOrderItems, err := ch.orderService.GetOrderItemsByOrderID(ctx.Request.Context(), orderID)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to fetch existing order items", zap.Error(err))
		return
	}

	existingItemIDs := make(map[uuid.UUID]bool)
	for _, item := range existingOrderItems {
		existingItemIDs[item.ID] = true
	}

	incomingItemIDs := make(map[uuid.UUID]bool)
	for _, item := range orderItems {
		if item.ID != uuid.Nil {
			incomingItemIDs[item.ID] = true
		}
	}

	// 7. Delete removed items (items not in the incoming request)
	for id := range existingItemIDs {
		if !incomingItemIDs[id] {
			if err := ch.orderService.DeleteOrderItemByID(ctx.Request.Context(), id); err != nil {
				common.HandleError(ctx, err)
				logger.Error(ctx, "Failed to delete removed order item", zap.String("order_item_id", id.String()), zap.Error(err))
				return
			}
			logger.Info(ctx, "Deleted removed order item", zap.String("order_item_id", id.String()))
		}
	}

	for _, orderItem := range orderItems {
		orderItem.OrderNo = updateOrder.OrderID
		if orderItem.ID != uuid.Nil {
			updateOrderItem, err := ch.orderService.UpdateOrderItem(ctx.Request.Context(), orderItem)
			if err != nil {
				common.HandleError(ctx, err)
				logger.Error(ctx, "Failed to update order item", zap.Error(err))
				return
			}
			logger.Info(ctx, "Order item updated", zap.Any("order item", updateOrderItem))
		} else {
			createOrderItem, err := ch.orderService.CreateOrderItem(ctx.Request.Context(), orderItem)
			if err != nil {
				common.HandleError(ctx, err)
				logger.Error(ctx, "Failed to create order item", zap.Error(err))
				return
			}
			logger.Info(ctx, "Order item created", zap.Any("order item", createOrderItem))

		}
	}
	payments.OrderID = updateOrder.OrderID
	createOrderPayment, err := ch.orderService.CreateOrderPayment(ctx.Request.Context(), payments)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to create order payment", zap.Error(err))
		return
	}
	logger.Info(ctx, "Order payment created", zap.Any("order payment", createOrderPayment))

	userName := updateOrder.CreatedBy
	if updateOrder.User != nil {
		userName = strings.TrimSpace(updateOrder.User.FirstName + " " + updateOrder.User.LastName)
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Order updated"},
		Description: fmt.Sprintf("%s update a Order %s/%s", userName, updateOrder.Type, updateOrder.OrderNo),
	})

	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdateOrderResponse(updateOrder))
	logger.Info(ctx, "Order updated successfully", zap.Any("order", updateOrder))
	go ch.bus.Publish("orders", events.Event{
		Type: "order.updated",
		Data: updateOrder,
	})
}
