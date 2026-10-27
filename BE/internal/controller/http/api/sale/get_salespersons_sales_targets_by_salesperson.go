package sale

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (sh *SaleHandler) GetSalesTargetsForSalespersons(ctx *gin.Context) {
	var req dto.SalesByDateRangeRequest

	if err := ctx.ShouldBindQuery(&req); err != nil {
		logger.Error(ctx, "Failed to bind sales target request")
		common.ValidationError(ctx, err)
		return
	}

	salespersonUUID, err := uuid.Parse(req.SalespersonID)
	if err != nil {
		logger.Error(ctx, "Invalid uuid")
		common.ValidationError(ctx, err)
		return
	}

	totalSalesTargets, err := sh.saleService.GetSalesTargetsForSalespersons(ctx, salespersonUUID, req.StartDate, req.EndDate)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	logger.Info(ctx, "Salesperson sales targets by date", zap.Any("salesperson", totalSalesTargets))
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewSalesTargetsBySalespersonResponse(totalSalesTargets))
}
