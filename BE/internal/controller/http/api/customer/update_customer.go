package customer

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *CustomerHandler) UpdateCustomer(ctx *gin.Context) {
	logger.Info(ctx, "Update customer request received")
	var req dto.UpdateCustomerRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	customer := mapper.UpdateCustomerRequestToDomain(&req)
	actingClerkID := ctx.GetString("user_id")
	updateCustomer, actorName, err := ch.customerService.UpdateCustomer(ctx, customer, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to update customer", zap.Error(err))
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Customer updated"},
		Description: fmt.Sprintf("%s update a  customer %s %s", actorName, updateCustomer.FirstName, updateCustomer.LastName),
	})
	logger.Info(ctx, "Customer updated", zap.Any("customer", updateCustomer))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdateCustomerResponse(updateCustomer))
}
