package quote

import (
	"errors"
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func (ch *QuoteHandler) UpdateQuote(ctx *gin.Context) {
	logger.Info(ctx, "Update quote request received")

	var uri dto.UpdateQuoteIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind URI", zap.Error(err))
		return
	}

	quoteID, err := uuid.Parse(uri.QuoteID)
	if err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Invalid UUID format", zap.Error(err))
		return
	}

	var req dto.UpdateFullQuoteRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind JSON", zap.Error(err))
		return
	}

	customer := mapper.UpdateCustomerRequestToDomain(&req.Customer)
	quote := mapper.UpdateQuoteRequestToDomain(&req.Quote)
	quoteItems := mapper.UpdateQuoteItemsRequestToDomain(&req.Items)

	existingCustomer, err := ch.customerService.GetCustomerByPhoneNo(ctx, customer.PhoneNo1)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error checking customer by phone", zap.Error(err))
		return
	}

	var customerID uuid.UUID
	if existingCustomer != nil {
		customer.CustomerID = existingCustomer.CustomerID
		actingClerkID := ctx.GetString("user_id")
		updatedCustomer, actorName, err := ch.customerService.UpdateCustomer(ctx, customer, actingClerkID)
		if err != nil {
			common.HandleError(ctx, err)
			logger.Error(ctx, "Failed to update existing customer", zap.Error(err))
			return
		}
		common.SetAuditInfo(ctx, common.AuditLogDetails{
			Headers:     map[string]string{"X-Response-Message": "Customer updated"},
			Description: fmt.Sprintf("%s update a  customer %s %s", actorName, updatedCustomer.FirstName, updatedCustomer.LastName),
		})
		logger.Info(ctx, "Existing customer updated", zap.Any("customer", updatedCustomer))
		customerID = updatedCustomer.CustomerID
	} else {
		createdCustomer, err := ch.customerService.CreateCustomer(ctx, customer)
		if err != nil {
			common.HandleError(ctx, err)
			logger.Error(ctx, "Failed to create new customer", zap.Error(err))
			return
		}
		logger.Info(ctx, "New customer created", zap.Any("customer", createdCustomer))
		customerID = createdCustomer.CustomerID
	}

	quote.CustomerID = customerID
	quote.QuoteID = quoteID

	updateQuote, err := ch.orderService.UpdateQuote(ctx.Request.Context(), quote)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to update quote", zap.Error(err))
		return
	}
	logger.Info(ctx, "Quote updated", zap.Any("quote", updateQuote))

	existingItems, err := ch.orderService.GetQuoteItemsByQuoteID(ctx, quoteID)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to fetch existing quote items", zap.Error(err))
		return
	}

	existingItemIDs := make(map[uuid.UUID]bool)
	for _, item := range existingItems {
		existingItemIDs[item.ID] = true
	}

	incomingItemIDs := make(map[uuid.UUID]bool)
	for _, item := range quoteItems {
		if item.ID != uuid.Nil {
			incomingItemIDs[item.ID] = true
		}
	}

	for id := range existingItemIDs {
		if !incomingItemIDs[id] {
			if err := ch.orderService.DeleteQuoteItemByID(ctx, id); err != nil {
				common.HandleError(ctx, err)
				logger.Error(ctx, "Failed to delete quote item", zap.Error(err))
				return
			}
			logger.Info(ctx, "Quote item deleted", zap.Any("quote_item_id", id))
		}
	}

	for _, quoteItem := range quoteItems {
		quoteItem.QuoteNo = updateQuote.QuoteID

		if quoteItem.ID != uuid.Nil {
			updateQuoteItem, err := ch.orderService.UpdateQuoteItem(ctx.Request.Context(), quoteItem)
			if err != nil {
				common.HandleError(ctx, err)
				logger.Error(ctx, "Failed to update quote item", zap.Error(err))
				return
			}
			logger.Info(ctx, "Quote item updated", zap.Any("quote item", updateQuoteItem))
		} else {
			createQuoteItem, err := ch.orderService.CreateQuoteItem(ctx.Request.Context(), quoteItem)
			if err != nil {
				common.HandleError(ctx, err)
				logger.Error(ctx, "Failed to create quote item", zap.Error(err))
				return
			}
			logger.Info(ctx, "Quote item created", zap.Any("quote item", createQuoteItem))
		}
	}
	userName := updateQuote.CreatedBy
	if updateQuote.User != nil {
		userName = strings.TrimSpace(updateQuote.User.FirstName + " " + updateQuote.User.LastName)
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Quote updated"},
		Description: fmt.Sprintf("%s update a Quote %s/%s", userName, updateQuote.Type, updateQuote.QuoteNo),
	})
	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdateQuoteResponse(updateQuote))
	logger.Info(ctx, "Quote updated successfully", zap.Any("quote", updateQuote))
}
