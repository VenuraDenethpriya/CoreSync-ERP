package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (hh *HrHandler) CreateTalentPool(c *gin.Context) {
	logger.Info(c, "Create talent pool request received")
	var req dto.CreateTalentPoolRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		logger.Error(c, "Failed to bind request", zap.Error(err))
		return
	}
	talentPool := mapper.TalentPoolRequstToDomain(&req)
	createdTalentPool, err := hh.hrService.CreateTalentPool(c, talentPool)
	if err != nil {
		common.HandleError(c, err)
		logger.Error(c, "Failed to create talent pool", zap.Error(err))
		return
	}
	logger.Info(c, "Talent pool created", zap.Any("talent pool", createdTalentPool))

	userName := createdTalentPool.CreatedBy
	if createdTalentPool.User != nil {
		userName = createdTalentPool.User.FirstName + " " + createdTalentPool.User.LastName
	}
	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Talent pool created"},
		Description: userName + "added " + createdTalentPool.CandidateName + "to talent pool",
	})
	common.HandleSuccess(c, common.StatusCreated, dto.NewCreateTalentPoolResponse(createdTalentPool))
	logger.Info(c, "Talent pool create successfully", zap.Any("talent pool", dto.NewCreateTalentPoolResponse(createdTalentPool)))

}
