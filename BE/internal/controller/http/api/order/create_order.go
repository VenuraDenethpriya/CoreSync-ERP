package order

import (
	"context"
	"errors"
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/events"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"
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

	// Map DTOs to domain models
	customerDomain := mapper.CustomerRequestToDomain(&req.Customer)
	order := mapper.OrderRequestToDomain(&req.Order)
	orderItems := mapper.OrderItemsRequestToDomain(&req.Items)
	payments := mapper.OrderPaymentsRequestToDomain(&req.Payments)

	var customerID uuid.UUID
	var customerToUse *domain.Customer

	// Attempt to get customer by phone number
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
			// logger.Info(ctx, "Customer found by phone number, updating existing customer", zap.Any("customer_id", existingCustomer.CustomerID))
			// actingClerkID := ctx.GetString("user_id")
			// updatedCustomer, actorName, updateErr := ch.customerService.UpdateCustomer(ctx, existingCustomer, actingClerkID) // existingCustomer now has updated fields
			// if updateErr != nil {
			// 	common.HandleError(ctx, updateErr)
			// 	logger.Error(ctx, "Failed to update customer", zap.Error(updateErr))
			// 	return
			// }
			// common.SetAuditInfo(ctx, common.AuditLogDetails{
			// 	Headers:     map[string]string{"X-Response-Message": "Customer updated"},
			// 	Description: fmt.Sprintf("%s update a  customer %s %s", actorName, updatedCustomer.FirstName, updatedCustomer.LastName),
			// })
			// logger.Info(ctx, "Existing customer updated successfully", zap.Any("customer", updatedCustomer))
			// customerToUse = updatedCustomer

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
	order.CustomerID = customerID
	createOrder, err := ch.orderService.CreateOrder(ctx, order)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to create order", zap.Error(err))
		return
	}
	logger.Info(ctx, "Order created", zap.Any("order", createOrder))

	// Create Order Items
	for _, orderItem := range orderItems {
		orderItem.OrderNo = createOrder.OrderID
		createOrderItem, err := ch.orderService.CreateOrderItem(ctx, orderItem)
		if err != nil {
			common.HandleError(ctx, err)
			logger.Error(ctx, "Failed to create order item", zap.Error(err))
			return
		}
		logger.Info(ctx, "Order item created", zap.Any("order item", createOrderItem))
	}

	// Create Payment
	payments.OrderID = createOrder.OrderID
	createPayment, err := ch.orderService.CreateOrderPayment(ctx, payments)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to create order payment", zap.Error(err))
		return
	}
	logger.Info(ctx, "Order payment created", zap.Any("order payment", createPayment))

	// // Custom description
	userName := createOrder.CreatedBy
	if createOrder.User != nil {
		userName = strings.TrimSpace(createOrder.User.FirstName + " " + createOrder.User.LastName)
	}

	// Helper function to set audit info
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
				"Your order %s%s is confirmed.\nTotal: LKR %.2f\nPayment received: %.2f\nWe’ll notify you when it’s ready. Thanks for choosing Renewaa!",
				createOrder.Type,
				createOrder.OrderNo,
				createOrder.Total,
				createPayment.Amount,
			)
		} else {
			message = fmt.Sprintf(
				"Your order %s%s is confirmed.\nTotal: LKR %.2f\nWe’ll notify you when it’s ready. Thanks for choosing Renewaa!",
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
