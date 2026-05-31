package quote

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (ch *QuoteHandler) DeleteQuote(ctx *gin.Context) {
	logger.Info(ctx, "Delete quote request received")

	// Bind and validate URI param
	var uri dto.DeleteQuoteIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		logger.Error(ctx, "Failed to bind URI param", zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}

	// Parse quote ID
	quoteUUID, err := uuid.Parse(uri.QuoteID)
	if err != nil {
		logger.Error(ctx, "Invalid UUID format", zap.Error(err))
		common.HandleError(ctx, err)
		return
	}

	// Call service to delete quote and its items
	deletedQuote, err := ch.orderService.DeleteQuote(ctx, quoteUUID)
	if err != nil {
		logger.Error(ctx, "Failed to delete quote and items", zap.Error(err))
		common.HandleError(ctx, err)
		return
	}
	userName := deletedQuote.CreatedBy
	if deletedQuote.User != nil {
		userName = strings.TrimSpace(deletedQuote.User.FirstName + " " + deletedQuote.User.LastName)
	}
	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Quote deleted"},
		Description: fmt.Sprintf("%s deleted a Quote %s/%s", userName, deletedQuote.Type, deletedQuote.QuoteNo),
	})
	logger.Info(ctx, "Quote and associated items deleted successfully", zap.String("quote_id", deletedQuote.QuoteID.String()))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteQuoteResponse(deletedQuote))
}
