package customer

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// GetCustomers godoc
// @Summary Get all customers
// @Description Retrieve a list of all customers
// @Tags Customers
// @Accept json
// @Produce json
// @Success 200 {object} dto.GetCustomersResponse
// @Failure 500 {object} common.ErrorResponse "Internal server error"
// @Router /customers [get]

func (ch *CustomerHandler) GetCustomers(ctx *gin.Context) {
	logger.Info(ctx, "Get customers request received")

	customers, err := ch.customerService.GetCustomers(ctx)
	if err != nil {
		logger.Error(ctx, "Error getting customers", zap.Error(err))
		common.HandleError(ctx, err)
		return
	}

	logger.Info(ctx, "Customers retrieved", zap.Any("customers", customers))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetCustomersResponse(customers))
}
