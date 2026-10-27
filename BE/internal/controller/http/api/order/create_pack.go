package order

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service/domain"
	"fmt"
	"math/rand"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (ch *OrderHandler) CreatePack(ctx *gin.Context) {
	logger.Info(ctx, "Create pack request received")

	var req dto.CreatePackRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}

	uniqueSerial := fmt.Sprintf("SN-%06d", rand.Intn(1000000))

	packQuantity := req.Quantity
	if packQuantity <= 0 {
		packQuantity = 1
	}

	packData := &domain.OrderItem{
		ProductID: req.ProductID,
		Quantity:  packQuantity,
		UnitPrice: req.UnitPrice,
		Note:      req.Note,
		Status:    "Drafted",
		SerialNo:  uniqueSerial,
		OrderNo:   nil,
	}

	actingClerkID := ctx.GetString("user_id")

	// Create the Pack Record
	createPack, username, err := ch.orderService.CreatePack(ctx, packData, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to create pack record", zap.Error(err))
		return
	}

	product, prodErr := ch.productService.GetOrderProductByID(ctx, req.ProductID)
	if prodErr != nil {
		logger.Error(ctx, "Failed to retrieve product details for auto-allocation", zap.Error(prodErr))
	} else if product != nil && product.Category == "BATTERY_PACK" {

		boms, bomErr := ch.productService.GetProductBomByID(ctx, product)
		if bomErr != nil {
			logger.Error(ctx, "Failed to fetch BOMs for battery pack", zap.Error(bomErr), zap.String("product_id", req.ProductID.String()))
		} else {
			for _, bom := range boms {

				allocCount := bom.Quantity * packQuantity

				logger.Info(ctx, "Auto-allocating BOM item for pack",
					zap.String("inventory_id", bom.InventoryID.String()),
					zap.Int("allocated_count", allocCount),
				)

				allocationReq := dto.CreateInventoryItemAllocationRequest{
					ItemID: bom.InventoryID,
					Count:  allocCount,
				}

				allocation := mapper.InventoryItemAllocationRequestToDomain(
					&allocationReq,
					uuid.Nil,
					createPack.ID,
					actingClerkID,
				)

				// Save the allocation
				_, allocErr := ch.inventoryService.CreateInventoryItemAllocation(ctx, allocation)
				if allocErr != nil {
					logger.Error(ctx, "Failed to auto-allocate BOM item for pack",
						zap.Error(allocErr),
						zap.String("inventory_id", bom.InventoryID.String()),
						zap.String("pack_id", createPack.ID.String()),
					)
				}
			}
		}
	}

	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Pack created"},
		Description: fmt.Sprintf("%s created a new pack %s", username, createPack.SerialNo),
	})

	logger.Info(ctx, "Pack record created", zap.Any("order_item", createPack))
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewPackResponse(createPack))
}
