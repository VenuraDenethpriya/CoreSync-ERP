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

func (or *OrderHandler) UpdatePack(ctx *gin.Context) {
	logger.Info(ctx, "Update pack status request received")
	var req dto.UpdatePackSRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	pack := mapper.UpdatePackUpdateToDomain(&req)
	actingClerkID := ctx.GetString("user_id")
	updatedPack, actorName, err := or.orderService.UpdatePack(ctx, pack, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to update pack status", zap.Error(err))
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Pack updated"},
		Description: fmt.Sprintf("%s updated the %s pack.", actorName, updatedPack.SerialNo),
	})
	logger.Info(ctx, "Pack updated", zap.Any("pack", updatedPack))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdatePackResponse(updatedPack))
}
