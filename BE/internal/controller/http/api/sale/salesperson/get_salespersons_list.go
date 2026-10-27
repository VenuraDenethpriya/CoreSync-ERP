package salesperson

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (sh *SalepersonHandler) GetSalespersonsList(ctx *gin.Context) {
	logger.Info(ctx, "Get salespersons list request received")
	var req dto.GetSalespersonNameRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	salespersonsList, err := sh.saleService.GetSalespersonsList(ctx, req.Status)
	if err != nil {
		logger.Error(ctx, "Error getting salespersonso list", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Salespersons list retrieved", zap.Any("salespersons list", salespersonsList))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetSalespersonsList(salespersonsList))

}
