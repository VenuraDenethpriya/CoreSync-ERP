package quote

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *QuoteHandler) GetQuoteType(ctx *gin.Context) {
	logger.Info(ctx, "Get quote type request received")

	quoteTypes, err := ch.orderService.GetQuoteType(ctx)
	if err != nil {
		logger.Error(ctx, "Error getting quote types", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}

	logger.Info(ctx, "Quote types retrieved", zap.Any("quote_types", quoteTypes))

	response := &dto.GetQuoteTypeResponse{
		QuoteNumbers: quoteTypes,
	}

	common.HandleSuccess(ctx, common.StatusOK, response)
}
