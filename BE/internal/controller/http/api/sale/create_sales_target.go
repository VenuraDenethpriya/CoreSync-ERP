package sale

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *SaleHandler) CreateSalesTarget(ctx *gin.Context) {
	logger.Info(ctx, "Create sales target request received")
	var req dto.CreateSalesTarget
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	salesTarget := mapper.SaleTargetRequestToDomain(&req)
	actingClerkID := ctx.GetString("user_id")
	createdSalesTarget, actorName, err := h.saleService.CreateSalesTarget(ctx, salesTarget, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Sales target created"},
		Description: fmt.Sprintf("%s created a new Sales target for %s", actorName, createdSalesTarget.Salesperson),
	})
	logger.Info(ctx, "Sales target created", zap.Any("sales target", createdSalesTarget))
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewCreatesalesTargetResponse(createdSalesTarget))
}
