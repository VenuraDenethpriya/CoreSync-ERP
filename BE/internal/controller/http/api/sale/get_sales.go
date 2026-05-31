package sale

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (s *SaleHandler) GetSales(ctx *gin.Context) {
	logger.Info(ctx, "Get sales request received")

	var searchParams dto.GetSalesRequest
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	sales, totalSales, err := s.saleService.GetSales(ctx, searchParams.Query, searchParams.Status, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting sales", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Sales retrieved", zap.Int("count", len(sales)))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetSalesResponses(sales, totalSales))
}
