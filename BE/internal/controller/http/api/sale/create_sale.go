package sale

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *SaleHandler) CreateSale(ctx *gin.Context) {
	logger.Info(ctx, "Create sale request received")
	var req dto.CreateSaleRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	sale := mapper.SaleRequestToDomain(&req)
	actingClerkID := ctx.GetString("user_id")
	createdSale, actorName, err := h.saleService.CreateSale(ctx, sale, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Sale created"},
		Description: fmt.Sprintf("%s created a new Sale for %s", actorName, createdSale.CustomerName),
	})
	logger.Info(ctx, "Sale created", zap.Any("sale", createdSale))
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewCreateSaleResponse(createdSale))
}
