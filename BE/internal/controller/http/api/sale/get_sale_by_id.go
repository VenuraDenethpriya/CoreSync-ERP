package sale

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service/domain"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (h *SaleHandler) GetSaleByID(ctx *gin.Context) {
	logger.Info(ctx, "GetSaleByID request received")
	var uri dto.GetSalesIDRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.ID)
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var sale domain.Sale
	sale.SalesID = parsedUUID
	getSale, err := h.saleService.GetSaleByID(ctx, &sale)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetSalesByIDResponse(getSale))
}
