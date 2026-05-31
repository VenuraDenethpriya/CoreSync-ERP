package quote

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *QuoteHandler) GetQuotes(ctx *gin.Context) {
	logger.Info(ctx, "Get quotes request recived")

	var searchParams dto.GetQuotesRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	quotes, totalQuotes, err := ch.orderService.GetQuotes(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error getting quotes", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Quotes fetched", zap.Any("quotes", quotes))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetQuotesResponse(quotes, totalQuotes))
}
