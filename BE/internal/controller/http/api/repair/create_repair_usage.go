package repair

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ri *RepairHandler) CreateRepairItemUsage(ctx *gin.Context) {
	logger.Info(ctx, "Create repair item usage request received")

	var req dto.CreateRepairItemUsageListRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	var responseList []*dto.CreateRepairItemUsageResponse

	for _, usageReq := range req.Usages {
		repairUsagePtr := mapper.RepairItemUsageRequestToDomain(&usageReq)

		createdUsage, err := ri.repairService.CreateRepairItemUsage(ctx, *repairUsagePtr)
		if err != nil {
			common.HandleError(ctx, err)
			logger.Error(ctx, "Failed to create repair item usage", zap.Error(err))
			return
		}

		userName := createdUsage.UserName
		if createdUsage.User != nil {
			userName = strings.TrimSpace(createdUsage.User.FirstName + " " + createdUsage.User.LastName)
		}

		common.SetAuditInfo(ctx, common.AuditLogDetails{
			Headers:     map[string]string{"X-Response-Message": "Repair usage created"},
			Description: fmt.Sprintf("%s used item %s for order %s", userName, createdUsage.ItemCode, createdUsage.JobNo),
		})

		responseList = append(responseList, dto.NewGetCreateRepairItemUsageResponse(createdUsage))
	}

	logger.Info(ctx, "Inventory repair usages processed successfully")
	common.HandleSuccess(ctx, common.StatusCreated, responseList)
}
