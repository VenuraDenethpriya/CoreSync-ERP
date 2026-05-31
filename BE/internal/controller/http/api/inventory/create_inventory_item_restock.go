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

func (ih *InventoryHandler) CreateInventoryItemRestock(c *gin.Context) {
	logger.Info(c, "Create Inventory Item Restock recived")
	var req dto.CreateInventoryItemRestockRequst
	if err := c.ShouldBindBodyWithJSON(&req); err != nil {
		common.ValidationError(c, err)
		logger.Error(c, "Failed to bind request", zap.Error(err))
		return
	}
	restock := mapper.InventoryItemRestockRequestToDomain(&req)
	createInventoryItemRestock, err := ih.inventoryService.CreateInventoryItemRestock(c, restock)
	if err != nil {
		common.HandleError(c, err)
		logger.Error(c, "Failed to create inventory item restock", zap.Error(err))
		return
	}

	// Custom description
	userName := createInventoryItemRestock.UserName
	if createInventoryItemRestock.User != nil {
		userName = strings.TrimSpace(createInventoryItemRestock.User.FirstName + " " + createInventoryItemRestock.User.LastName)
	}
	// Helper function to set audit info
	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Item restocked"},
		Description: fmt.Sprintf("%s restocked %d units of  %s", userName, createInventoryItemRestock.Quantity, createInventoryItemRestock.ItemCode),
	})
	logger.Info(c, "Inventory item restock created", zap.Any("inventory item restock", createInventoryItemRestock))
	common.HandleSuccess(c, common.StatusCreated, dto.NewCreateItemRestockResponse(createInventoryItemRestock))
}
