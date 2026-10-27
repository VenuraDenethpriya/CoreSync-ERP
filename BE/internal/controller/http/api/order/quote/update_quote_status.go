package quote

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

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

	actingClerkID := ctx.GetString("user_id")
	updatedQuote, actorName, err := ch.orderService.UpdateQuoteStatus(ctx.Request.Context(), quote, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error updating quote status", zap.Any("error", err))
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Quote status updated"},
		Description: fmt.Sprintf("%s update quote status %s/%s", actorName, updatedQuote.Type, updatedQuote.QuoteNo),
	})
	logger.Info(ctx, "Quote updated", zap.Any("quote", updatedQuote))
	common.HandleSuccess(ctx, common.StatusOK, updatedQuote)
}
