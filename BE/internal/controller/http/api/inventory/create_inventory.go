package inventory

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
	// Custom description
	userName := createInventory.CreatedBy
	if createInventory.User != nil {
		userName = strings.TrimSpace(createInventory.User.FirstName + " " + createInventory.User.LastName)
	}
	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Inventory created"},
		Description: fmt.Sprintf("%s created inventory  %s", userName, createInventory.ItemCode),
	})
	logger.Info(ctx, "Inventory created", zap.Any("inventory", createInventory))
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewCreateInventoryResponse(createInventory))
}
