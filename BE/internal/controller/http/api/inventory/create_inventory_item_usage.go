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

//	func (ih *InventoryHandler) CreateInventoryItemUsage(ctx *gin.Context) {
//		logger.Info(ctx, "Create inventory item usage request received")
//		var req dto.CreateInventoryItemUsageListRequest
//		if err := ctx.ShouldBindJSON(&req); err != nil {
//			common.ValidationError(ctx, err)
//			logger.Error(ctx, "Failed to bind request", zap.Error(err))
//			return
//		}
//		for _, usageReq := range req.Usages {
//			inventoryUsage := mapper.InventoryItemUsageRequestToDomain(&usageReq)
//			createInventoryItemUsage, err := ih.inventoryService.CreateInventoryItemUsage(ctx, inventoryUsage)
//			if err != nil {
//				common.HandleError(ctx, err)
//				logger.Error(ctx, "Failed to create inventory item usage", zap.Error(err))
//				return
//			}
//			// Custom description
//			userName := createInventoryItemUsage.UserName
//			if createInventoryItemUsage.User != nil {
//				userName = strings.TrimSpace(createInventoryItemUsage.User.FirstName + " " + createInventoryItemUsage.User.LastName)
//			}
//			// Helper function to set audit info
//			common.SetAuditInfo(ctx, common.AuditLogDetails{
//				Headers:     map[string]string{"X-Response-Message": "Item usage created"},
//				Description: fmt.Sprintf("%s used  from  %s to order %s%s", userName, createInventoryItemUsage.ItemCode, createInventoryItemUsage.OrderType, createInventoryItemUsage.OrederNo),
//			})
//			logger.Info(ctx, "Inventory item usage created", zap.Any("inventory item usage", createInventoryItemUsage))
//			common.HandleSuccess(ctx, common.StatusCreated, dto.NewGetCreateInventoryItemUsageResponse(createInventoryItemUsage))
//		}
//	}

func (ih *InventoryHandler) CreateInventoryItemUsage(ctx *gin.Context) {
	logger.Info(ctx, "Create inventory item usage request received")

	var req dto.CreateInventoryItemUsageListRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	// Prepare a slice to hold all responses
	var responseList []*dto.CreateInventoryItemUsageResponse

	for _, usageReq := range req.Usages {
		// Mapper returns *domain.InventoryItemUsage
		inventoryUsagePtr := mapper.InventoryItemUsageRequestToDomain(&usageReq)

		// FIX 1: Dereference pointer using * to match Service signature
		createdUsage, err := ih.inventoryService.CreateInventoryItemUsage(ctx, *inventoryUsagePtr)
		if err != nil {
			// If one fails, you might want to stop everything or continue.
			// Here we stop and return error.
			common.HandleError(ctx, err)
			logger.Error(ctx, "Failed to create inventory item usage", zap.Error(err))
			return
		}

		// Audit Log Logic
		userName := createdUsage.UserName
		if createdUsage.User != nil {
			userName = strings.TrimSpace(createdUsage.User.FirstName + " " + createdUsage.User.LastName)
		}

		// Note: Audit logging in a loop might be spammy, consider batching it if possible
		common.SetAuditInfo(ctx, common.AuditLogDetails{
			Headers:     map[string]string{"X-Response-Message": "Item usage created"},
			Description: fmt.Sprintf("%s used item %s for order %s%s", userName, createdUsage.ItemCode, createdUsage.OrderType, createdUsage.OrederNo),
		})

		// FIX 2: Append to list, DO NOT return success here
		responseList = append(responseList, dto.NewGetCreateInventoryItemUsageResponse(createdUsage))
	}

	logger.Info(ctx, "Inventory item usages processed successfully")

	// FIX 3: Send single response with the list of created items
	common.HandleSuccess(ctx, common.StatusCreated, responseList)
}
