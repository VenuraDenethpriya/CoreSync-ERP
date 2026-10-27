package order

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (ch *OrderHandler) DeletePack(ctx *gin.Context) {
	logger.Info(ctx, "Delete order request received")

	// Bind and validate URI param
	var uri dto.DeletePackIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		logger.Error(ctx, "Failed to bind URI param", zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}

	packUUID, err := uuid.Parse(uri.PackID)
	if err != nil {
		logger.Error(ctx, "Invalid UUID format", zap.Error(err))
		common.HandleError(ctx, err)
		return
	}
	actingClerkID := ctx.GetString("user_id")
	deletedPack, actorName, err := ch.orderService.DeletePack(ctx, packUUID, actingClerkID)
	if err != nil {
		logger.Error(ctx, "Failed to delete pack", zap.Error(err))
		common.HandleError(ctx, err)
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Pack deleted"},
		Description: fmt.Sprintf("%s deleted a Pack %s", actorName, deletedPack.SerialNo),
	})

	logger.Info(ctx, "Pack deleted successfully", zap.String("order_id", deletedPack.ID.String()))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeletePackResponse(deletedPack))
}
