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

func (hh *HrHandler) DeleteInterviewTracker(ctx *gin.Context) {
	logger.Info(ctx, "Delete interview tracker request received")
	var uri dto.DeleteInterviewTrackerRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.InterviewTrackerId)
	logger.Info(ctx, "Parsed UUID", zap.String("interview-tracker-id", uri.InterviewTrackerId), zap.Any("parsed-uuid", parsedUUID))
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var talentPool domain.TalentPool
	talentPool.ID = parsedUUID
	actingClerkID := ctx.GetString("user_id")
	deleteInterviewTracker, actorName, err := hh.hrService.DeleteInterviewTracker(ctx, &talentPool, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Interviewee deleted"},
		Description: fmt.Sprintf("%s deleted a interviewee", actorName),
	})
	logger.Info(ctx, "Interview tracker deleted", zap.Any("Interview tracker", deleteInterviewTracker))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteInterviewTrackerResponse(deleteInterviewTracker))

}
