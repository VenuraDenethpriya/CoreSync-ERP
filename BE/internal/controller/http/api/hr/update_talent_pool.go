package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (hh *HrHandler) UpdateTalentPool(ctx *gin.Context) {
	logger.Info(ctx, "Update talent pool request received")
	var req dto.UpdateTalentPoolRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	upateTalentPool := mapper.UpdateTalentPoolRequstToDomain(&req)
	actingClerkID := ctx.GetString("user_id")
	updateTalentPool, actorName, err := hh.hrService.UpdateTalentPool(ctx, upateTalentPool, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Talent pool updated"},
		Description: fmt.Sprintf("%s update a  talen pool. Member name: %s", actorName, updateTalentPool.CandidateName),
	})
	logger.Info(ctx, "Talent pool updated successfully", zap.Any("talentPoolId", updateTalentPool.ID))
	common.HandleSuccess(ctx, common.StatusAccepted, dto.NewUpdateTalentPoolResponse(updateTalentPool))
}
