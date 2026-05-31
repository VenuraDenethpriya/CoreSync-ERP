package salesperson

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (s *SalepersonHandler) GetSalespersons(ctx *gin.Context) {
	logger.Info(ctx, "Get salesperosns requst recived")

	var searchParams dto.GetSalespersonRequest
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.HandleError(ctx, err)
	}
	salesperson, totalSalesNo, totalCommission, totalSalespersons, err := s.saleService.GetSalespersons(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)

	if err != nil {
		logger.Error(ctx, "Error getting salespersons", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Salespersons retrieved", zap.Int("conunt", len(salesperson)))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetSalespersonsResponse(salesperson, totalSalesNo, totalCommission, totalSalespersons))
}
