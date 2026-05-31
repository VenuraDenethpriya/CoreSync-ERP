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

func (ih *InventoryHandler) CreateInventoryItemAllocation(c *gin.Context) {
	logger.Info(c, "Create inventory item allocation request received")

	var req dto.CreateInventoryItemAllocaationListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		logger.Error(c, "Failed to bind request", zap.Error(err))
		return
	}

	var createInventoryItemAllocationList []dto.CreateInventoryItemAllocateResponse

	for _, item := range req.Allocation.Items {
		inventoryAllocation := mapper.InventoryItemAllocationRequestToDomain(
			&item,
			req.Allocation.OrderID,
			req.Allocation.Allocator,
		)

		createInventoryItemAllocation, err := ih.inventoryService.CreateInventoryItemAllocation(c, inventoryAllocation)
		if err != nil {
			common.HandleError(c, err)
			logger.Error(c, "Failed to create inventory item allocation", zap.Error(err))
			return
		}
		logger.Info(c, "Inventory item allocation created", zap.Any("inventory item allocation", createInventoryItemAllocation))
		userName := createInventoryItemAllocation.Allocator
		if createInventoryItemAllocation.User != nil {
			userName = strings.TrimSpace(createInventoryItemAllocation.User.FirstName + " " + createInventoryItemAllocation.User.LastName)
		}
		common.SetAuditInfo(c, common.AuditLogDetails{
			Headers: map[string]string{"X-Response-Message": "Item allocation created"},
			Description: fmt.Sprintf("%s allocated %d units of Item %s to Order %s%s",
				userName, createInventoryItemAllocation.Count, createInventoryItemAllocation.ItemCode, createInventoryItemAllocation.OrderType, createInventoryItemAllocation.OrderNo),
		})
		createInventoryItemAllocationList = append(
			createInventoryItemAllocationList,
			*dto.NewGetCreateInventoryItemAllocateResponse(createInventoryItemAllocation),
		)
	}

	common.HandleSuccess(c, common.StatusCreated, createInventoryItemAllocationList)
	logger.Info(c, "Inventory item allocation created successfully", zap.Any("allocations", createInventoryItemAllocationList))
}
