package repair

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (rh *RepairHandler) UpdateRepair(c *gin.Context) {
	logger.Info(c, "Update repair request received")
	var req dto.UpdateRepairRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error(c, "Error binding JSON: %v", zap.Error(err))
		common.ValidationError(c, err)
		return
	}
	passedUUID, err := uuid.Parse(req.ID)
	logger.Info(c, "Parsed UUID", zap.String("repair-id", req.ID), zap.Any("parsed-uuid", passedUUID))
	if err != nil {
		logger.Error(c, "Error parsing UUID", zap.Error(err))
		common.HandleError(c, err)
		return
	}
	repair := mapper.UpdateRepairRequestToDomain(&req)
	repair.ID = passedUUID
	actingClerkID := c.GetString("user_id")
	updatedRepair, actorName, err := rh.repairService.UpdateRepair(c, repair, actingClerkID)
	if err != nil {
		logger.Error(c, "Error updating repair", zap.Error(err))
		common.HandleError(c, err)
		return
	}
	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Repair Job updated"},
		Description: fmt.Sprintf("%s updated the job no %s", actorName, updatedRepair.JobNo),
	})
	logger.Info(c, "Repair Job updated", zap.Any("repair", updatedRepair))
	common.HandleSuccess(c, common.StatusOK, dto.NewUpdateRepairResponse(updatedRepair))
}
