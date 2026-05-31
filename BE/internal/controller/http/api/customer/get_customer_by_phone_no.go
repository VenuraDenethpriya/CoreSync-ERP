package customer

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *CustomerHandler) GetCustomerByPhoneNo(ctx *gin.Context) {
	logger.Info(ctx, "Get customer by phone no request received")

	var uri dto.GetCustomerByPhoneNoRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error parsing search params", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Get customer by phone no uri recived")
	customer, err := ch.customerService.GetCustomerByPhoneNo(ctx, uri.PhoneNo1)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error getting customer by phone no", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Customer fetched", zap.Any("customer", customer))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetCustomerByIdResponse(customer))
}
