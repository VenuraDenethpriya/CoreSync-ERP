package product

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"
	"strings"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// UpdateProduct godoc
// @Summary Update a product
// @Description Update the details of an existing product by its UUID
// @Tags Products
// @Accept json
// @Produce json
// @Param product_id path string true "Product ID (UUID)"
// @Param product body dto.UpdateProductRequest true "Product update payload"
// @Success 201 {object} dto.ProductResponse
// @Failure 400 {object} common.ErrorResponse "Invalid input or UUID"
// @Failure 500 {object} common.ErrorResponse "Internal server error"
// @Router /products/{product_id} [put]

func (ch *ProductHandler) UpdateProduct(ctx *gin.Context) {
	logger.Info(ctx, "Update product request recived")
	var uri dto.UpdateProductIdRequest
	var req dto.UpdateProductRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	parsedUUID, err := uuid.Parse(uri.ProductID)
	logger.Info(ctx, "Parsed UUID", zap.String("product-id", uri.ProductID), zap.Any("parsed-uuid", parsedUUID))
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}

	product := mapper.UpdateProductRequestToDomain(&req)
	product.ProductID = parsedUUID

	updateProduct, err := ch.productService.UpdateProduct(ctx, product)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	userName := updateProduct.CreatedBy
	if updateProduct.User != nil {
		userName = strings.TrimSpace(updateProduct.User.FirstName + " " + updateProduct.User.LastName)
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Product updated"},
		Description: fmt.Sprintf("%s update a product %s", userName, updateProduct.Name),
	})
	logger.Info(ctx, "Product updated", zap.Any("product", updateProduct))
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewProductResponse(updateProduct))
}
