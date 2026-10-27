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

func (ch *InventoryHandler) CreateInventoryOrders(ctx *gin.Context) {
	logger.Info(ctx, "Create inventory order request received")
	var req dto.CreateInventoryOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	inventoryOrder := mapper.InventoryOrderRequestToDomain(&req)
	createInventory, err := ch.inventoryService.CreateInventoryOrder(ctx, inventoryOrder)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to create inventory order", zap.Error(err))
		return
	}
	userName := createInventory.CreatedBy
	if createInventory.User != nil {
		userName = strings.TCoreSyncpace(createInventory.User.FirstName + " " + createInventory.User.LastName)
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Inventory Order created"},
		Description: fmt.Sprintf("%s created inventory order %s for Item code %s  qty. %s ", userName, createInventory.OrderNo, createInventory.ItemCode, createInventory.OrderQuantity),
	})
	logger.Info(ctx, "Inventory order created", zap.Any("inventory order", createInventory))
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewCreateInventoryOrderResponse(createInventory))
}
