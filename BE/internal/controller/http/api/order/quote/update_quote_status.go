package quote

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *QuoteHandler) UpdateQuoteStatus(ctx *gin.Context) {
	logger.Info(ctx, "Update quote status request recived")
	var req dto.UpdateQuoteStatusRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Error updating quote status", zap.Any("error", err))
		return
	}

	quote := mapper.QuoteStatusUpdateToDomain(&req)

	updatedQuote, err := ch.orderService.UpdateQuoteStatus(ctx.Request.Context(), quote)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error updating quote status", zap.Any("error", err))
		return
	}
	userName := updatedQuote.CreatedBy
	if updatedQuote.User != nil {
		userName = strings.TrimSpace(updatedQuote.User.FirstName + " " + updatedQuote.User.LastName)
	}
	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Quote status updated"},
		Description: fmt.Sprintf("%s update quote status %s/%s", userName, updatedQuote.Type, updatedQuote.QuoteNo),
	})
	logger.Info(ctx, "Quote updated", zap.Any("quote", updatedQuote))
	common.HandleSuccess(ctx, common.StatusOK, updatedQuote)
}
