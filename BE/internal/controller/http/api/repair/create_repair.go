package repair

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *RepairHandler) CreateRepair(c *gin.Context) {
	logger.Info(c, "Create repair request received")
	var req dto.CreateRepairRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		return
	}
	repair := mapper.RepairRequestToDomain(&req)
	actingClerkID := c.GetString("user_id")
	createdRepair, actorName, err := h.repairService.CreateRepair(c, repair, actingClerkID)
	if err != nil {
		common.HandleError(c, err)
		return
	}
	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Repair Job created"},
		Description: fmt.Sprintf("%s created a new Repair Job %s for %s", actorName, createdRepair.JobNo, createdRepair.CustomerName),
	})
	logger.Info(c, "Repair Job created", zap.Any("repair", createdRepair))
	common.HandleSuccess(c, common.StatusCreated, dto.NewCreateRepairResponse(createdRepair))
}
