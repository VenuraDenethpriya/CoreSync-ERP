package salesperson

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (h *SalepersonHandler) GetSalespersonByID(ctx *gin.Context) {
	logger.Info(ctx, "GetSalespersonByID request received")
	var uri dto.GetSalespersonIDRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.ID)
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var salesperson domain.Salesperson
	salesperson.ID = parsedUUID
	getSalesperson, totalSalesNoLastMoth, totalCommissionLastMoth, totalSalesNo, totalCommission, err := h.saleService.GetSalespersonByID(ctx, &salesperson)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetSalespersonIDResponse(getSalesperson, totalSalesNoLastMoth, totalCommissionLastMoth, totalSalesNo, totalCommission))
}
