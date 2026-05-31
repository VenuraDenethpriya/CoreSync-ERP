package repair

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (rh *RepairHandler) GetRepairItemUsage(ctx *gin.Context) {
	logger.Info(ctx, "Get repair item usage request received")

	var query dto.GetRepairItemUsageQuery
	if err := ctx.ShouldBindQuery(&query); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	var jobID, itemID uuid.UUID
	var err error

	if query.JobID != "" {
		jobID, err = uuid.Parse(query.JobID)
		if err != nil {
			common.HandleError(ctx, fmt.Errorf("invalid job_id UUID: %v", err))
			return
		}
	}

	if query.ItemID != "" {
		itemID, err = uuid.Parse(query.ItemID)
		if err != nil {
			common.HandleError(ctx, fmt.Errorf("invalid item_id UUID: %v", err))
			return
		}
	}

	usages, total, mode, err := rh.repairService.GetRepairItemUsages(ctx, jobID, itemID, query.Limit, query.Offset)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	response := dto.NewGetRepairItemUsageGroupedListResponse(usages, total, mode)

	logger.Info(ctx, "Repair item usages retrieved", zap.Int("count", len(response.Items)), zap.Int("total_groups", total))
	common.HandleSuccess(ctx, common.StatusAccepted, response)
}
