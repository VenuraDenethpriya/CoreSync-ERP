package inventory

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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

	var orderID uuid.UUID
	if req.Allocation.OrderID != nil {
		orderID = *req.Allocation.OrderID
	}

	var packID uuid.UUID
	if req.Allocation.PackID != nil {
		packID = *req.Allocation.PackID
	}
	for _, item := range req.Allocation.Items {
		inventoryAllocation := mapper.InventoryItemAllocationRequestToDomain(
			&item,
			orderID,
			packID,
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
