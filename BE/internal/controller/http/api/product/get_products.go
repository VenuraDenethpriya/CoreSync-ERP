package product

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// GetProducts godoc
// @Summary Get products list
// @Description Retrieve a list of products with optional pagination and filtering
// @Tags Products
// @Accept json
// @Produce json
// @Param name query string false "Filter by product name"
// @Param category query string false "Filter by category"
// @Param is_active query string false "Filter by active status (true/false)"
// @Param limit query int false "Limit the number of results"
// @Param offset query int false "Offset for pagination"
// @Success 200 {object} dto.GetProductsResponse
// @Failure 400 {object} common.ErrorResponse "Validation error"
// @Failure 500 {object} common.ErrorResponse "Internal server error"
// @Router /products [get]

func (ch *ProductHandler) GetProducts(ctx *gin.Context) {
	logger.Info(ctx, "Get products request recived")

	var searchParams dto.GetProductsRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	getProducts, totalProducts, err := ch.productService.GetProducts(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting products", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Products retrieved", zap.Any("products", getProducts))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetProductResponse(getProducts, totalProducts))
}
