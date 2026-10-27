package inventory

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *InventoryHandler) CreateInventoryFromOrders(ctx *gin.Context) {
	var req dto.CreateInventoryFromOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	result, err := ch.inventoryService.CreateInventoryFromOrders(ctx, &req)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	userName := result.CreatedBy
	if result.User != nil {
		userName = strings.TCoreSyncpace(result.User.FirstName + " " + result.User.LastName)
	}

	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Restock created"},
		Description: fmt.Sprintf("%s created inventory restock for Item code  %s", userName, result.ItemCode),
	})
	logger.Info(ctx, "Inventory created", zap.Any("inventory", result))
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewCreateInventoryResponse(result))
}
