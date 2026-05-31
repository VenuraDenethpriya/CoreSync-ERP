package salesperson

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

func (sh *SalepersonHandler) UpdateSalesperson(ctx *gin.Context) {
	logger.Info(ctx, "Update salesperson requesd recived")
	var req dto.UpdateSalespersonRequest

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
	salesperson := mapper.UpdateSalespersonRequestToDomain(&req)
	salesperson.ID = parsedUUID
	actingClerkID := ctx.GetString("user_id")
	updatedSalesperson, actorName, err := sh.saleService.UpdateSalesperson(ctx, salesperson, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Salesperson updated"},
		Description: fmt.Sprintf("%s updated the Salesperson  %s %s", actorName, updatedSalesperson.FirstName, updatedSalesperson.LastName),
	})
	logger.Info(ctx, "Salesperson updated", zap.Any("salesperson", updatedSalesperson))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdateSalespersonResponse(updatedSalesperson))
}
