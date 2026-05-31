package quote

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *QuoteHandler) GetLastQuoteNo(ctx *gin.Context) {
	logger.Info(ctx, "Get last quote no request recived")
	quoteNo, err := ch.orderService.GetLastQuoteNo(ctx)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error getting last quote no", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Last quote no retrieved", zap.Any("quote_no", quoteNo))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetLastQuoteNoResponse(quoteNo))
}
