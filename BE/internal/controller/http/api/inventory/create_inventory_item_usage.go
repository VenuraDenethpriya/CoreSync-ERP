package inventory

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ih *InventoryHandler) CreateInventoryItemUsage(ctx *gin.Context) {
	logger.Info(ctx, "Create inventory item usage request received")

	var req dto.CreateInventoryItemUsageListRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	var responseList []*dto.CreateInventoryItemUsageResponse

	for _, usageReq := range req.Usages {
		inventoryUsagePtr := mapper.InventoryItemUsageRequestToDomain(&usageReq)

		createdUsage, err := ih.inventoryService.CreateInventoryItemUsage(ctx, *inventoryUsagePtr)
		if err != nil {
			common.HandleError(ctx, err)
			logger.Error(ctx, "Failed to create inventory item usage", zap.Error(err))
			return
		}

		userName := createdUsage.UserName
		if createdUsage.User != nil {
			userName = strings.TCoreSyncpace(createdUsage.User.FirstName + " " + createdUsage.User.LastName)
		}

		common.SetAuditInfo(ctx, common.AuditLogDetails{
			Headers:     map[string]string{"X-Response-Message": "Item usage created"},
			Description: fmt.Sprintf("%s used item %s for order %s%s", userName, createdUsage.ItemCode, createdUsage.OrderType, createdUsage.OrederNo),
		})

		responseList = append(responseList, dto.NewGetCreateInventoryItemUsageResponse(createdUsage))
	}

	logger.Info(ctx, "Inventory item usages processed successfully")
	common.HandleSuccess(ctx, common.StatusCreated, responseList)
}
