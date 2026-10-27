package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service/domain"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (hh *HrHandler) GetInterviewTrackerById(ctx *gin.Context) {
	logger.Info(ctx, "Talent pool by id request received")

	var uri dto.GetInterviewTrackerIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		logger.Error(ctx, "Error binding uri parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}

	parsedUUID, err := uuid.Parse(uri.ID)
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}

	var talentPool domain.TalentPool
	talentPool.ID = parsedUUID

	getInterviewTrackers, err := hh.hrService.GetInterviewTrackerByID(ctx, &talentPool)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetInterviewTrackerIdResponse(getInterviewTrackers))
}
