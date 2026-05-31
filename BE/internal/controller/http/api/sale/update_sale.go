package sale

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (sh *SaleHandler) UpdateSale(ctx *gin.Context) {
	logger.Info(ctx, "Update sale request received")

	// var uri dto.UpdateSaleIDRequest
	var req dto.UpdateSaleRequest

	// if err := ctx.ShouldBindUri(&uri); err != nil {
	// 	common.ValidationError(ctx, err)
	// 	return
	// }
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	parsedUUID, err := uuid.Parse(req.ID)
	logger.Info(ctx, "Parsed UUID", zap.String("sale-id", req.ID), zap.Any("parsed-uuid", parsedUUID))
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	sale := mapper.UpdateSaleRequestToDomain(&req)
	sale.SalesID = parsedUUID
	actingClerkID := ctx.GetString("user_id")
	updatedSale, actorName, err := sh.saleService.UpdateSale(ctx, sale, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Sale updated"},
		Description: fmt.Sprintf("%s updated the Sale for %s", actorName, updatedSale.CustomerName),
	})
	logger.Info(ctx, "Sale updated", zap.Any("sale", updatedSale))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdateSaleResponse(updatedSale))
}
