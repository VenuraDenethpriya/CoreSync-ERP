package customer

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (ch *CustomerHandler) DeleteCustomer(ctx *gin.Context) {
	logger.Info(ctx, "Delete customer request received")
	var uri dto.DeleteCustomerRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}
	customerUUID, err := uuid.Parse(uri.CustomerID)
	if err != nil {
		logger.Error(ctx, "Invalid UUID format", zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}
	var customer domain.Customer
	customer.CustomerID = customerUUID
	actingClerkID := ctx.GetString("user_id")
	deleteCustomer, actorName, err := ch.customerService.DeleteCustomer(ctx, &customer, actingClerkID)
	if err != nil {
		logger.Error(ctx, "Failed to delete customer", zap.Error(err))
		common.HandleError(ctx, err)
		return
	}

	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Customer deleted"},
		Description: fmt.Sprintf("%s deleted a customer %s %s", actorName, deleteCustomer.FirstName, deleteCustomer.LastName),
	})
	logger.Info(ctx, "Customer deleted", zap.Any("customer", deleteCustomer))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteCustomerResponse(deleteCustomer))
}
