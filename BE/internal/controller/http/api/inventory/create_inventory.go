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

func (ch *InventoryHandler) CreateInventory(ctx *gin.Context) {
	logger.Info(ctx, "Create inventory request received")
	var req dto.CreateInventoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	inventory := mapper.InventoryRequestToDomain(&req)
	createInventory, err := ch.inventoryService.CreateInventory(ctx, inventory)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to create inventory", zap.Error(err))
		return
	}
	userName := createInventory.CreatedBy
	if createInventory.User != nil {
		userName = strings.TCoreSyncpace(createInventory.User.FirstName + " " + createInventory.User.LastName)
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Inventory created"},
		Description: fmt.Sprintf("%s created inventory  %s", userName, createInventory.ItemCode),
	})
	logger.Info(ctx, "Inventory created", zap.Any("inventory", createInventory))
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewCreateInventoryResponse(createInventory))
}
