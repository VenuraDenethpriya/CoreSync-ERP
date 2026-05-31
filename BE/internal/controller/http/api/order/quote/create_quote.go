package quote

import (
	"errors"
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/service/domain"
	"strings"

	"github.com/google/uuid"

	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func (ch *QuoteHandler) CreateQuote(ctx *gin.Context) {
	logger.Info(ctx, "Create quote request received")

	var req dto.CreateFullQuoteRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}

	customerDomain := mapper.CustomerRequestToDomain(&req.Customer)
	quote := mapper.QuoteRequestToDomain(&req.Quote)
	quoteItems := mapper.QuoteItemsRequestToDomain(&req.Items)

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
				Description: fmt.Sprintf("%s update a customer %s %s", actorName, updatedCustomer.FirstName, updatedCustomer.LastName),
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

	quote.CustomerID = customerID

	createdQuote, err := ch.orderService.CreateQuote(ctx.Request.Context(), quote)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to create quote", zap.Error(err))
		return
	}
	logger.Info(ctx, "Quote created", zap.Any("quote", createdQuote))

	for _, quoteItem := range quoteItems {
		quoteItem.QuoteNo = createdQuote.QuoteID
		createdItem, err := ch.orderService.CreateQuoteItem(ctx.Request.Context(), quoteItem)
		if err != nil {
			common.HandleError(ctx, err)
			logger.Error(ctx, "Failed to create quote item", zap.Error(err))
			return
		}
		logger.Info(ctx, "Quote item created", zap.Any("quote item", createdItem))
	}
	userName := createdQuote.CreatedBy
	if createdQuote.User != nil {
		userName = strings.TrimSpace(createdQuote.User.FirstName + " " + createdQuote.User.LastName)
	}
	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Quote created"},
		Description: fmt.Sprintf("%s created a new Quote %s/%s", userName, createdQuote.Type, createdQuote.QuoteNo),
	})

	common.HandleSuccess(ctx, common.StatusCreated, dto.NewQuoteResponse(createdQuote))
	logger.Info(ctx, "Quote created successfully", zap.Any("quote", createdQuote))
}
