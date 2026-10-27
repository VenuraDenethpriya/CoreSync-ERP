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

// GetProductBomByID godoc
// @Summary Get product BOM by ID
// @Description Retrieve a product BOM using its UUID
// @Tags Products
// @Accept json
// @Produce json
// @Param product_id path string true "Product ID (UUID)"
// @Success 200 {object} dto.GetProductBomByIdResponse
// @Failure 400 {object} common.ErrorResponse "Invalid UUID or validation error"
// @Failure 500 {object} common.ErrorResponse "Internal server error"
// @Router /products/{product_id} [get]

func (ch *ProductHandler) GetProductBomByID(ctx *gin.Context) {
	logger.Info(ctx, "Get product BOM by ID request received")

	var uri dto.GetProductBomByIdRequest
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
	getProducts, err := ch.productService.GetProductBomByID(ctx, &product)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Product BOMs retrieved", zap.Any("product-boms", getProducts))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetProductBomByIdResponseList(getProducts))
}
