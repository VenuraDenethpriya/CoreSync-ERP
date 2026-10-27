package order

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/events"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service/domain"
	"fmt"
	"math/rand"

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

	// FETCH OLD ORDER FIRST TO CALCULATE PREVIOUS QUANTITIES!
	// (Must happen before we update anything)
	oldOrder, err := ch.orderService.GetOrderById(ctx.Request.Context(), &domain.Order{OrderID: orderID})
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	oldBatteryCounts := make(map[uuid.UUID]int)
	for _, item := range oldOrder.Items {
		oldBatteryCounts[item.ProductID] += item.Quantity
	}

	// UPDATE CUSTOMER
	actingClerkID := ctx.GetString("user_id")
	updateCustomer, actorName, err := ch.customerService.UpdateCustomer(ctx.Request.Context(), customer, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to update customer", zap.Error(err))
		return
	}

	order.CustomerID = updateCustomer.CustomerID
	order.OrderID = orderID

	// PREPARE TRACKING MAPS
	newBatteryCounts := make(map[uuid.UUID]int)
	var batteryPackSummaries []domain.OrderItemSummary
	incomingStandardItemIDs := make(map[uuid.UUID]bool)

	// SEPARATE AND PROCESS INCOMING ITEMS
	for _, orderItem := range orderItems {
		product, err := ch.productService.GetOrderProductByID(ctx.Request.Context(), orderItem.ProductID)
		if err != nil {
			common.HandleError(ctx, err)
			return
		}

		isBatteryPack := product != nil && product.Category == "BATTERY_PACK"

		if isBatteryPack {
			// BATTERY PACKS: Add to summary & count
			newBatteryCounts[orderItem.ProductID] += orderItem.Quantity
			batteryPackSummaries = append(batteryPackSummaries, domain.OrderItemSummary{
				ProductID:   orderItem.ProductID,
				ProductName: product.Name,
				UnitPrice:   orderItem.UnitPrice,
				Quantity:    orderItem.Quantity,
			})

			// Protect already assigned battery packs from being deleted!
			if orderItem.ID != uuid.Nil {
				incomingStandardItemIDs[orderItem.ID] = true
				orderItem.OrderNo = &orderID
				ch.orderService.UpdateOrderItem(ctx.Request.Context(), orderItem)
			}
		} else {
			// STANDARD ITEMS: Check if exists. If it has an ID, update qty/price. If nil, create new.
			orderItem.OrderNo = &orderID
			if orderItem.ID != uuid.Nil {
				incomingStandardItemIDs[orderItem.ID] = true
				ch.orderService.UpdateOrderItem(ctx.Request.Context(), orderItem)
			} else {
				createOrderItem, _ := ch.orderService.CreateOrderItem(ctx.Request.Context(), orderItem)
				if createOrderItem != nil {
					incomingStandardItemIDs[createOrderItem.ID] = true
				}
			}
		}
	}

	// DELETE REMOVED ITEMS
	existingOrderItems, _ := ch.orderService.GetOrderItemsByOrderID(ctx.Request.Context(), orderID)
	for _, item := range existingOrderItems {
		if !incomingStandardItemIDs[item.ID] {
			ch.orderService.DeleteOrderItemByID(ctx.Request.Context(), item.ID)

			// If the user deleted an ASSIGNED battery pack from the UI,
			// reduce oldQty so we don't accidentally delete an unassigned one too!
			product, _ := ch.productService.GetOrderProductByID(ctx.Request.Context(), item.ProductID)
			if product != nil && product.Category == "BATTERY_PACK" {
				oldBatteryCounts[item.ProductID] -= 1
			}
		}
	}

	// RECONCILE BATTERY PACKS (Increase or Decrease physical unlinked packs)
	for prodID, newQty := range newBatteryCounts {
		oldQty := oldBatteryCounts[prodID]
		diff := newQty - oldQty

		if diff > 0 {
			// INCREASED: Create new unlinked packs
			unitPrice := 0.0
			for _, s := range batteryPackSummaries {
				if s.ProductID == prodID {
					unitPrice = s.UnitPrice
				}
			}

			for i := 0; i < diff; i++ {
				uniqueSerial := fmt.Sprintf("SN-%06d", rand.Intn(1000000))
				ch.orderService.CreateOrderItem(ctx.Request.Context(), &domain.OrderItem{
					ID:        uuid.New(),
					ProductID: prodID,
					Quantity:  1,
					UnitPrice: unitPrice,
					Status:    "Drafted",
					SerialNo:  uniqueSerial,
					OrderNo:   nil,
				})
			}
		} else if diff < 0 {
			// DECREASED: Delete excess unlinked packs
			ch.orderService.DeleteUnassignedBatteryPacks(ctx.Request.Context(), prodID, -diff)
		}
	}

	// Check if a battery pack was completely removed from the order
	for prodID, oldQty := range oldBatteryCounts {
		if newBatteryCounts[prodID] == 0 && oldQty > 0 {
			ch.orderService.DeleteUnassignedBatteryPacks(ctx.Request.Context(), prodID, oldQty)
		}
	}

	// SAVE THE NEW JSON SUMMARY (Only call UpdateOrder ONCE here!)
	order.Items = batteryPackSummaries
	updateOrder, err := ch.orderService.UpdateOrder(ctx.Request.Context(), order)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	// PAYMENTS AND AUDIT LOGS
	payments.OrderID = updateOrder.OrderID
	createOrderPayment, err := ch.orderService.CreateOrderPayment(ctx.Request.Context(), payments)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to create order payment", zap.Error(err))
		return
	}
	logger.Info(ctx, "Order payment created", zap.Any("order payment", createOrderPayment))

	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Order updated"},
		Description: fmt.Sprintf("%s updated a customer %s %s and Order %s/%s", actorName, updateCustomer.FirstName, updateCustomer.LastName, updateOrder.Type, updateOrder.OrderNo),
	})

	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdateOrderResponse(updateOrder))
	logger.Info(ctx, "Order updated successfully", zap.Any("order", updateOrder))

	go ch.bus.Publish("orders", events.Event{
		Type: "order.updated",
		Data: updateOrder,
	})
}
