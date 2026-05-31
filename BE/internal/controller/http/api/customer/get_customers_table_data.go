package customer

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *CustomerHandler) GetCustomersTableData(ctx *gin.Context) {
	logger.Info(ctx, "Get customers table data request recived")
	customers, err := ch.customerService.GetCustomersTableData(ctx)
	if err != nil {
		logger.Error(ctx, "Error getting customers table data", zap.Error(err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Customers table data retrieved", zap.Any("customers", customers))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewCustomersTableDataResponse(customers))
}
