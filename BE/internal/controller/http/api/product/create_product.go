package product

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

// CreateProduct godoc
// @Summary Create a new product
// @Description Add a new product to the system
// @Tags Products
// @Accept json
// @Produce json
// @Param product body dto.CreateProductRequest true "Product details"
// @Success 201 {object} dto.ProductResponse
// @Failure 400 {object} common.ErrorResponse "Validation error"
// @Failure 500 {object} common.ErrorResponse "Internal server error"
// @Router /products [post]

func (ch *ProductHandler) CreateProduct(ctx *gin.Context) {
	logger.Info(ctx, "Create product request recived")
	var req dto.CreateProductRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	product := mapper.ProductRequestToDomain(&req)
	createProduct, err := ch.productService.CreateProduct(ctx, product)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	// // Custom description
	userName := createProduct.CreatedBy
	if createProduct.User != nil {
		userName = strings.TrimSpace(createProduct.User.FirstName + " " + createProduct.User.LastName)
	}
	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Product created"},
		Description: fmt.Sprintf("%s created a new Product %s", userName, createProduct.Name),
	})
	logger.Info(ctx, "Product created", zap.Any("product", createProduct))
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewProductResponse(createProduct))
}
