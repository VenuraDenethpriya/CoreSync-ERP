package order

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (or *OrderHandler) UpdatePackProduction(ctx *gin.Context) {
	logger.Info(ctx, "Update pack production request received")
	var req dto.UpdatePacksProductionIDRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	pack := mapper.UpdatePacksProductionToDomain(&req)
	actingClerkID := ctx.GetString("user_id")
	updatedPack, actorName, err := or.orderService.UpdatePackProduction(ctx, pack, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to update pack production id", zap.Error(err))
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Pack production updated"},
		Description: fmt.Sprintf("%s updated the %s pack.", actorName, updatedPack.SerialNo),
	})
	logger.Info(ctx, "Pack updated", zap.Any("pack", updatedPack))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdatePacksProductionResponse(updatedPack))
}
