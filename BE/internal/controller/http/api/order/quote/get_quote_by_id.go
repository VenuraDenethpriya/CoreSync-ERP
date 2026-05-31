package quote

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (ch *QuoteHandler) GetQuoteByID(ctx *gin.Context) {
	logger.Info(ctx, "Get quote by ID request recived")
	var uri dto.GetQuoteIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}

	quoteUUID, err := uuid.Parse(uri.QuoteID)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Invalid quote ID format", zap.Error(err))
		return
	}
	var quote domain.Quote
	quote.QuoteID = quoteUUID
	getQuote, err := ch.orderService.GetQuoteByID(ctx, &quote)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to get quote", zap.Error(err))
		return
	}
	logger.Info(ctx, "Quote retrieved", zap.Any("quote", getQuote))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetQuoteByIdResponse(getQuote))
}
