package customer

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *CustomerHandler) SearchCustomers(ctx *gin.Context) {
	logger.Info(ctx, "Searching customers", zap.String("method", "GET"), zap.String("path", "/customers/search"))

	var searchParams dto.SearchCustomersURI

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.String("method", "GET"), zap.String("path", "/customers/search"), zap.Error(err))
		common.HandleError(ctx, err)
		return
	}

	customers, totalCustomers, err := ch.customerService.SearchCustomers(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)

	if err != nil {
		logger.Error(ctx, "Error searching customers", zap.String("method", "GET"), zap.String("path", "/customers/search"), zap.Error(err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Customers searched", zap.String("method", "GET"), zap.String("path", "/customers/search"), zap.Any("customers", customers))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewSearchCustomersResponse(customers, totalCustomers))
}
