package repair

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (h *RepairHandler) DeleteRepair(c *gin.Context) {
	logger.Info(c, "Delete repair request received")
	var uri dto.DeleteRepairIDRequest
	if err := c.ShouldBindUri(&uri); err != nil {
		logger.Error(c, "Error binding URI parameters", zap.Error(err))
		common.ValidationError(c, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.RepairID)
	logger.Info(c, "Parsed UUID", zap.String("repair-id", uri.RepairID), zap.Any("parsed-uuid", parsedUUID))
	if err != nil {
		logger.Error(c, "Error parsing UUID", zap.Error(err))
		common.HandleError(c, err)
		return
	}
	var repair domain.Repair
	repair.ID = parsedUUID
	actingClerkID := c.GetString("user_id")
	deletedRepair, actorName, err := h.repairService.DeleteRepair(c, &repair, actingClerkID)
	if err != nil {
		logger.Error(c, "Error deleting repair", zap.Error(err))
		common.HandleError(c, err)
		return
	}

	if deletedRepair == nil {
		common.HandleError(c, fmt.Errorf("repair with ID %s not found", parsedUUID))
		return
	}

	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Repair Job deleted"},
		Description: fmt.Sprintf("%s deleted Repair Job %s for %s", actorName, deletedRepair.JobNo, deletedRepair.CustomerName),
	})
	logger.Info(c, "Repair Job deleted", zap.Any("repair", deletedRepair))
	common.HandleSuccess(c, common.StatusOK, dto.NewDeleteRepairIDResponse(deletedRepair))
}
