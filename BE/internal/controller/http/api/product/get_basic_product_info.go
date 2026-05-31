package product

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *ProductHandler) GetBasicProductInfo(ctx *gin.Context) {
	logger.Info(ctx, "Get basic product info request received")
	products, err := ch.productService.GetBasicProductInfo(ctx)
	if err != nil {
		logger.Error(ctx, "Error getting basic product info", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Basic product info retrieved", zap.Any("products", products))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetBasicProductInfoListResponse(products))
}
