package customer

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// CreateCustomer godoc
// @Summary      Create a new customer
// @Description  Receives customer details and creates a new customer record in the system
// @Tags         Customers
// @Accept       json
// @Produce      json
// @Param        customer  body      dto.CreateCustomerRequest  true  "Customer data"
// @Success      201       {object}  dto.CreateCustomerResponse
// @Failure      400       {object}  common.ErrorResponse "Validation error"
// @Failure      500       {object}  common.ErrorResponse "Internal server error"
// @Router       /api/v1/customers [post]

func (ch *CustomerHandler) CreateCustomer(ctx *gin.Context) {
	logger.Info(ctx, "Create customer request received")

	var req dto.CreateCustomerRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Error(ctx, "Error binding request", zap.String("method", "POST"), zap.String("path", "/customers"), zap.Any("request", req), zap.Error(err))
		common.ValidationError(ctx, err)
		return
	}

	// 🔍 Check for existing customer by phone number
	existingCustomer, err := ch.customerService.GetCustomerByPhoneNo(ctx, req.PhoneNo1)
	if err != nil {
		logger.Error(ctx, "Error getting customer by phone number", zap.String("method", "POST"), zap.String("path", "/customers"), zap.Any("request", req), zap.Error(err))
		common.HandleError(ctx, err)
		return
	}

	if existingCustomer != nil {
		logger.Info(ctx, "Customer already exists with phone number", zap.String("phone_no", req.PhoneNo1))
		common.HandleSuccess(ctx, common.StatusOK, gin.H{"message": "Customer already exists", "customer_id": existingCustomer.CustomerID})
		return
	}

	customer := mapper.CustomerRequestToDomain(&req)
	createdCustomer, err := ch.customerService.CreateCustomer(ctx, customer)
	if err != nil {
		logger.Error(ctx, "Error creating customer", zap.String("method", "POST"), zap.String("path", "/customers"), zap.Any("request", req), zap.Error(err))
		common.HandleError(ctx, err)
		return
	}
	// Custom description
	userName := createdCustomer.CreatedBy
	if createdCustomer.User != nil {
		userName = strings.TrimSpace(createdCustomer.User.FirstName + " " + createdCustomer.User.LastName)
	}
	// Helper function to set audit info
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Customer created"},
		Description: fmt.Sprintf("%s created a new customer %s %s", userName, createdCustomer.FirstName, createdCustomer.LastName),
	})
	logger.Info(ctx, "Customer created", zap.Any("customer", createdCustomer))
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewCreateCustomerResponse(createdCustomer))
}
