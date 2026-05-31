package repair

import (
	"github.com/google/uuid"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *RepairHandler) GetRepairByID(c *gin.Context) {
	logger.Info(c, "Get repair by ID request received")

	var uri dto.GetRepairIDRequest
	if err := c.ShouldBindUri(&uri); err != nil {
		logger.Error(c, "Error binding URI parameters", zap.Error(err))
		common.ValidationError(c, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.ID)
	if err != nil {
		logger.Error(c, "Error parsing UUID", zap.Error(err))
		common.HandleError(c, err)
		return
	}
	var repair domain.Repair
	repair.ID = parsedUUID
	getRepair, err := h.repairService.GetRepairByID(c, &repair)
	if err != nil {
		logger.Error(c, "Error getting repair by ID", zap.Error(err))
		common.HandleError(c, err)
		return
	}
	common.HandleSuccess(c, common.StatusOK, dto.NewGetRepairIDResponse(getRepair))
}
