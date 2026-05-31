package product

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

// GetProductByID godoc
// @Summary Get product by ID
// @Description Retrieve a product using its UUID
// @Tags Products
// @Accept json
// @Produce json
// @Param product_id path string true "Product ID (UUID)"
// @Success 200 {object} dto.GetProductByIdResponse
// @Failure 400 {object} common.ErrorResponse "Invalid UUID or validation error"
// @Failure 500 {object} common.ErrorResponse "Internal server error"
// @Router /products/{product_id} [get]

func (ch *ProductHandler) GetProductByID(ctx *gin.Context) {
	logger.Info(ctx, "Get product by ID request recived")

	var uri dto.GetProductIdRequest
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
	getProduct, err := ch.productService.GetProductByID(ctx, &product)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Product retrieved", zap.Any("product", getProduct))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetProductByIdResponse(getProduct))
}
