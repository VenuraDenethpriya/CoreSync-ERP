package order

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/events"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service/domain"
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func (ch *OrderHandler) CreateOrder(ctx *gin.Context) {
	logger.Info(ctx, "Create order request received")

	var req dto.CreateFullOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	fmt.Println("SalesID received:", req.Order.SalesID)
	// actingClerkID := ctx.GetString("user_id")

	// Map DTOs to domain models
	customerDomain := mapper.CustomerRequestToDomain(&req.Customer)
	order := mapper.OrderRequestToDomain(&req.Order)
	orderItems := mapper.OrderItemsRequestToDomain(&req.Items)
	payments := mapper.OrderPaymentsRequestToDomain(&req.Payments)

	var customerID uuid.UUID
	var customerToUse *domain.Customer

	existingCustomer, err := ch.customerService.GetCustomerByPhoneNo(ctx, customerDomain.PhoneNo1)

	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		// Case 1: Customer not found, create a new one
		logger.Info(ctx, "Customer not found by phone number, creating new customer", zap.String("phone_no", customerDomain.PhoneNo1))
		createdCustomer, createErr := ch.customerService.CreateCustomer(ctx, customerDomain)
		if createErr != nil {
			common.HandleError(ctx, createErr)
			logger.Error(ctx, "Failed to create customer", zap.Error(createErr))
			return
		}
		logger.Info(ctx, "New customer created successfully", zap.Any("customer", createdCustomer))
		customerToUse = createdCustomer

	case err != nil:
		// Case 2: An error occurred during lookup (other than record not found)
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error checking customer by phone number", zap.Error(err))
		return

	default:
		// Case 3: Customer found or GetCustomerByPhoneNo returned (nil, nil) for not found.
		if existingCustomer == nil {
			logger.Info(ctx, "Customer lookup returned nil with no error, treating as new customer", zap.String("phone_no", customerDomain.PhoneNo1))
			createdCustomer, createErr := ch.customerService.CreateCustomer(ctx, customerDomain)
			if createErr != nil {
				common.HandleError(ctx, createErr)
				logger.Error(ctx, "Failed to create customer (after nil lookup)", zap.Error(createErr))
				return
			}
			logger.Info(ctx, "New customer created successfully (after nil lookup)", zap.Any("customer", createdCustomer))
			customerToUse = createdCustomer
		} else {
			logger.Info(ctx, "Customer found by phone number, updating existing customer", zap.Any("customer_id", existingCustomer.CustomerID))
			customerDomain.CustomerID = existingCustomer.CustomerID

			actingClerkID := ctx.GetString("user_id")
			updatedCustomer, actorName, updateErr := ch.customerService.UpdateCustomer(ctx, customerDomain, actingClerkID)
			if updateErr != nil {
				common.HandleError(ctx, updateErr)
				logger.Error(ctx, "Failed to update customer", zap.Error(updateErr))
				return
			}
			common.SetAuditInfo(ctx, common.AuditLogDetails{
				Headers:     map[string]string{"X-Response-Message": "Customer updated"},
				Description: fmt.Sprintf("%s update a  customer %s %s", actorName, updatedCustomer.FirstName, updatedCustomer.LastName),
			})
			logger.Info(ctx, "Existing customer updated successfully", zap.Any("customer", updatedCustomer))
			customerToUse = updatedCustomer
		}
	}

	if customerToUse == nil {
		err := errors.New("internal server error: customer object is nil after processing")
		common.HandleError(ctx, err)
		logger.Error(ctx, "Customer object became nil unexpectedly after customer processing logic")
		return
	}

	customerID = customerToUse.CustomerID

	// Create Order
	order.OrderID = uuid.New()
	order.CustomerID = customerID

	var preparedItems []*domain.OrderItem
	var batteryPackSummaries []domain.OrderItemSummary

	isBatteryPackMap := make(map[uuid.UUID]bool)
	batteryPackBOMs := make(map[uuid.UUID][]*domain.Bom)

	for _, requestedItem := range orderItems {

		// Fetch the product details to inspect its category
		product, err := ch.productService.GetOrderProductByID(ctx, requestedItem.ProductID)
		if err != nil {
			common.HandleError(ctx, err)
			logger.Error(ctx, "Failed to retrieve product details", zap.Error(err))
			return
		}

		isBatteryPack := product != nil && product.Category == "BATTERY_PACK"
		isBatteryPackMap[requestedItem.ProductID] = isBatteryPack

		if isBatteryPack {
			if batteryPackBOMs[requestedItem.ProductID] == nil {
				boms, err := ch.productService.GetProductBomByID(ctx, product)
				if err != nil {
					logger.Error(ctx, "Failed to fetch BOMs for battery pack", zap.Error(err), zap.String("product_id", requestedItem.ProductID.String()))
				} else {
					batteryPackBOMs[requestedItem.ProductID] = boms
				}
			}

			batteryPackSummaries = append(batteryPackSummaries, domain.OrderItemSummary{
				ProductID:   requestedItem.ProductID,
				ProductName: product.Name,
				UnitPrice:   requestedItem.UnitPrice,
				Quantity:    requestedItem.Quantity,
				Note:        requestedItem.Note,
			})

			continue
		}

		for i := 0; i < requestedItem.Quantity; i++ {
			itemID := uuid.New()
			orderIDRef := order.OrderID

			singleOrderItem := &domain.OrderItem{
				ID:        itemID,
				ProductID: requestedItem.ProductID,
				Quantity:  1,
				UnitPrice: requestedItem.UnitPrice,
				Note:      requestedItem.Note,
				Status:    "",
				SerialNo:  "",
				OrderNo:   &orderIDRef,
			}

			preparedItems = append(preparedItems, singleOrderItem)
		}
	}

	if len(batteryPackSummaries) > 0 {
		order.Items = batteryPackSummaries
	}

	createOrder, err := ch.orderService.CreateOrder(ctx, order)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to create order", zap.Error(err))
		return
	}
	logger.Info(ctx, "Order created", zap.Any("order", createOrder))

	for _, itemToSave := range preparedItems {
		createOrderItem, err := ch.orderService.CreateOrderItem(ctx, itemToSave)
		if err != nil {
			common.HandleError(ctx, err)
			logger.Error(ctx, "Failed to create individual order item record", zap.Error(err))
			return
		}
		logger.Info(ctx, "Single order item record created", zap.Any("order_item", createOrderItem))
	}

	// for _, requestedItem := range orderItems {
	// 	if isBatteryPackMap[requestedItem.ProductID] {
	// 		boms := batteryPackBOMs[requestedItem.ProductID]

	// 		for i := 0; i < requestedItem.Quantity; i++ {
	// 			for _, bom := range boms {
	// 				logger.Info(ctx, "Auto-allocating BOM item",
	// 					zap.String("inventory_id", bom.InventoryID.String()),
	// 					zap.Int("bom_quantity", bom.Quantity),
	// 				)

	// 				allocationReq := dto.CreateInventoryItemAllocationRequest{
	// 					ItemID: bom.InventoryID,
	// 					Count:  bom.Quantity,
	// 				}

	// 				allocation := mapper.InventoryItemAllocationRequestToDomain(
	// 					&allocationReq,
	// 					createOrder.OrderID,
	// 					uuid.Nil,
	// 					actingClerkID,
	// 				)

	// 				_, allocErr := ch.inventoryService.CreateInventoryItemAllocation(ctx, allocation)
	// 				if allocErr != nil {
	// 					logger.Error(ctx, "Failed to auto-allocate BOM item for battery pack",
	// 						zap.Error(allocErr),
	// 						zap.String("inventory_id", bom.InventoryID.String()),
	// 					)
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	// Create Payment
	payments.OrderID = createOrder.OrderID
	createPayment, err := ch.orderService.CreateOrderPayment(ctx, payments)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to create order payment", zap.Error(err))
		return
	}
	logger.Info(ctx, "Order payment created", zap.Any("order payment", createPayment))

	// Custom description
	userName := createOrder.CreatedBy
	if createOrder.User != nil {
		userName = strings.TrimSpace(createOrder.User.FirstName + " " + createOrder.User.LastName)
	}

	// Set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Order created"},
		Description: fmt.Sprintf("%s created a new Order %s/%s", userName, createOrder.Type, createOrder.OrderNo),
	})

	// Respond Success
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewOrderResponse(createOrder))
	logger.Info(ctx, "Order created successfully", zap.Any("order", createOrder))

	go func() {
		var message string
		if createPayment.Amount > 0 {
			message = fmt.Sprintf(
				"Your order %s%s is confirmed.\nTotal: LKR %.2f\nPayment received: %.2f\nWe’ll notify you when it’s ready. Thanks for choosing CoreSync!",
				createOrder.Type,
				createOrder.OrderNo,
				createOrder.Total,
				createPayment.Amount,
			)
		} else {
			message = fmt.Sprintf(
				"Your order %s%s is confirmed.\nTotal: LKR %.2f\nWe’ll notify you when it’s ready. Thanks for choosing CoreSync!",
				createOrder.Type,
				createOrder.OrderNo,
				createOrder.Total,
			)
		}

		if ch.smsService != nil && customerToUse != nil && customerToUse.PhoneNo1 != "" {
			err := ch.smsService.SendSMS(context.Background(), customerToUse.PhoneNo1, message)
			if err != nil {
				logger.Error(context.Background(), "Failed to send order confirmation SMS",
					zap.Error(err),
					zap.String("order_id", createOrder.OrderID.String()),
					zap.String("customer_phone", customerToUse.PhoneNo1),
				)
			} else {
				logger.Info(context.Background(), "Order confirmation SMS sent successfully",
					zap.String("order_id", createOrder.OrderID.String()),
				)
			}
		}
	}()

	go ch.bus.Publish("orders", events.Event{
		Type: "order.created",
		Data: createOrder,
	})
}
