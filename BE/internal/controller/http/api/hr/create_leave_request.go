package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (hh *HrHandler) CreateLeaveRequest(c *gin.Context) {
	logger.Info(c, "Create leave request received")
	var req dto.CreateLeaveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		logger.Error(c, "Failed to bind request", zap.Error(err))
		return
	}
	leave := mapper.LeaveRequestToDomain(&req)
	createdLeaveRequest, err := hh.hrService.CreateLeaveRequest(c, leave)
	if err != nil {
		common.HandleError(c, err)
		logger.Error(c, "Failed to create leave request", zap.Error(err))
		return
	}
	logger.Info(c, "Leave request created", zap.Any("leave request", createdLeaveRequest))

	userName := createdLeaveRequest.CreatedBy
	if createdLeaveRequest.User != nil {
		userName = createdLeaveRequest.User.FirstName + " " + createdLeaveRequest.User.LastName
	}
	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Leave request created"},
		Description: userName + "create new leave request ",
	})
	common.HandleSuccess(c, common.StatusCreated, dto.NewCreateLeaveRequestResponse(createdLeaveRequest))
	logger.Info(c, "Leave request created successfully", zap.Any("leave request", dto.NewCreateLeaveRequestResponse(createdLeaveRequest)))
}
