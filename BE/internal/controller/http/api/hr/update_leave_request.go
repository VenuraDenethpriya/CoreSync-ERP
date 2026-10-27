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

func (hh *HrHandler) UpdateLeaveRequest(ctx *gin.Context) {
	logger.Info(ctx, "Update leave request received")
	var req dto.UpdateLeaveRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	updateLeaveRequest := mapper.UpdateLeaveRequestToDomain(&req)
	actingClerkID := ctx.GetString("user_id")
	updateLeaveRequest, actorName, err := hh.hrService.UpdateLeaveRequest(ctx, updateLeaveRequest, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Leave request updated"},
		Description: fmt.Sprintf("%s update an leave request of: %s", actorName, updateLeaveRequest.AcceptedBy),
	})
	logger.Info(ctx, "Leave request updated successfully", zap.Any("leave request", updateLeaveRequest.ID))
	common.HandleSuccess(ctx, common.StatusAccepted, dto.NewUpdateLeaveRequestResponse(updateLeaveRequest))
}
