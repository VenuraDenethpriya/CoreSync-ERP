package product

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service/domain"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

// DeleteProductBom godoc
// @Summary Delete a product BOM
// @Description Delete a product BOM by its UUID
// @Tags Products
// @Accept json
// @Produce json
// @Param product_bom_id path string true "Product BOM ID (UUID)"
// @Success 204 {object} dto.DeleteProductResponse
// @Failure 400 {object} common.ErrorResponse "Invalid UUID or validation error"
// @Failure 500 {object} common.ErrorResponse "Internal server error"
// @Router /products/{product_bom_id} [delete]

func (ch *ProductHandler) DeleteProductBom(ctx *gin.Context) {
	logger.Info(ctx, "Delete product BOM request received")

	var uri dto.DeleteProductBomIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	parsedUUID, err := uuid.Parse(uri.ProductBomID)
	if err != nil {
		logger.Error(ctx, "Invalid UUID format", zap.Error(err))
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}

	logger.Info(ctx, "Parsed UUID", zap.String("product-bom-id", uri.ProductBomID))

	var bom domain.Bom
	bom.ID = parsedUUID
	actingClerkID := ctx.GetString("user_id")

	deleteBom, actorName, err := ch.productService.DeleteProductBom(ctx, &bom, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	itemName := "Unknown Item"
	if deleteBom.Inventory != nil {
		itemName = deleteBom.Inventory.ItemName
	}

	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Product BOM deleted"},
		Description: fmt.Sprintf("%s deleted a product BOM item: %s", actorName, itemName),
	})

	logger.Info(ctx, "Product BOM deleted", zap.Any("product-bom", deleteBom))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteProductBomResponse(deleteBom))
}
