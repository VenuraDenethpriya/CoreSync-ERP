package salesperson

import (
	"net/http"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (sh *SalepersonHandler) GetSalespersonsSaleByDateRange(ctx *gin.Context) {
	var req dto.SalesByDateRangeRequest

	// Bind query params into DTO
	if err := ctx.ShouldBindQuery(&req); err != nil {
		logger.Error(ctx, "Failed to bind salesperson request")
		common.ValidationError(ctx, err)
		return
	}
	salespersonUUID, err := uuid.Parse(req.SalespersonID)
	if err != nil {
		logger.Error(ctx, "Invalid uuid")
		common.ValidationError(ctx, err)
		return
	}
	// Fetch totals from repository
	totalSales, totalCommission, err := sh.saleService.GetSalesAndCommissionByDateRange(ctx, salespersonUUID, req.StartDate, req.EndDate)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	logger.Info(ctx, "Salesperson sales by date", zap.Any("salesperson", totalSales))
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewSalesByDateRangeResponse(totalSales, totalCommission))
}
