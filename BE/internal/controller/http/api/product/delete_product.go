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

// DeleteProduct godoc
// @Summary Delete a product
// @Description Delete a product by its UUID
// @Tags Products
// @Accept json
// @Produce json
// @Param product_id path string true "Product ID (UUID)"
// @Success 204 {object} dto.DeleteProductResponse
// @Failure 400 {object} common.ErrorResponse "Invalid UUID or validation error"
// @Failure 500 {object} common.ErrorResponse "Internal server error"
// @Router /products/{product_id} [delete]

func (ch *ProductHandler) DeleteProduct(ctx *gin.Context) {
	logger.Info(ctx, "Delete product request recived")

	var uri dto.DeleteProductIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.ProductID)
	logger.Info(ctx, "Parsed UUID", zap.String("product-id", uri.ProductID), zap.Any("parsed-uuid", parsedUUID))
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var product domain.Product
	product.ProductID = parsedUUID

	actingClerkID := ctx.GetString("user_id")
	deleteProduct, actorName, err := ch.productService.DeleteProduct(ctx, &product, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Product deleted"},
		Description: fmt.Sprintf("%s deleted a product %s", actorName, deleteProduct.Name),
	})
	logger.Info(ctx, "Product deleted", zap.Any("product", deleteProduct))
	common.HandleSuccess(ctx, common.StatusNoContent, dto.NewDeleteProductResponse(deleteProduct))
}
