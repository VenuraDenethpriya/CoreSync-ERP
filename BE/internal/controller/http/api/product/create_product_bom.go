package product

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"
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

func (ch *ProductHandler) CreateProductBom(ctx *gin.Context) {
	logger.Info(ctx, "Create product bom request received")

	var req dto.CreateProductBomRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	boms := mapper.ProductBomRequestToDomainList(&req)

	createdBoms, err := ch.productService.CreateProductBom(ctx, boms)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	var userName, productName string
	if len(createdBoms) > 0 {
		firstBom := createdBoms[0]
		userName = firstBom.CreatedBy
		if firstBom.User != nil {
			userName = strings.TrimSpace(firstBom.User.FirstName + " " + firstBom.User.LastName)
		}
		if firstBom.Product != nil {
			productName = firstBom.Product.Name
		}
	}

	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Product BOM created"},
		Description: fmt.Sprintf("%s added %d items to the Product BOM for %s", userName, len(createdBoms), productName),
	})

	logger.Info(ctx, "Product BOMs created", zap.Int("bom_count", len(createdBoms)))

	common.HandleSuccess(ctx, common.StatusCreated, dto.NewCreateProductBomResponseList(createdBoms))
}
