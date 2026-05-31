package customer

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
)

// GetCustomerByID godoc
// @Summary Get customer by ID
// @Description Retrieve a customer using their UUID
// @Tags Customers
// @Accept json
// @Produce json
// @Param customer_id path string true "Customer ID (UUID)"
// @Success 200 {object} dto.GetCustomerByIdResponse
// @Failure 400 {object} common.ErrorResponse "Invalid UUID or validation error"
// @Failure 500 {object} common.ErrorResponse "Internal server error"
// @Router /customers/{customer_id} [get]

func (ch *CustomerHandler) GetCustomerByID(ctx *gin.Context) {
	logger.Info(ctx, "Get customer by ID request recived")
	var uri dto.GetCustomerIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.CustomerID)
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var customer domain.Customer
	customer.CustomerID = parsedUUID
	getCustomer, err := ch.customerService.GetCustomerByID(ctx, &customer)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetCustomerByIdResponse(getCustomer))
}
