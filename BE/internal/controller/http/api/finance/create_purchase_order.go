package finance

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (fh *FinanceHandler) CreatePurchaseOrder(c *gin.Context) {
	logger.Info(c, "Create purchase order request received")
	var req dto.CreatePurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		logger.Error(c, "Failed to bind request", zap.Error(err))
		return
	}
	site := mapper.PurchaseOrderRequestToDomain(&req)
	createdPurchaseOrder, err := fh.financeService.CreatePurchaseOrder(c, site)
	if err != nil {
		common.HandleError(c, err)
		logger.Error(c, "Failed to create purchase order", zap.Error(err))
		return
	}
	logger.Info(c, "Purchase order created", zap.Any("task", createdPurchaseOrder))

	userName := createdPurchaseOrder.CreatedBy
	if createdPurchaseOrder.User != nil {
		userName = createdPurchaseOrder.User.FirstName + " " + createdPurchaseOrder.User.LastName
	}
	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Purchase order created"},
		Description: userName + "Purchae order created" + createdPurchaseOrder.PurchaseNo,
	})
	common.HandleSuccess(c, common.StatusCreated, dto.NewCreatePurchaseOrderResponse(createdPurchaseOrder))
	logger.Info(c, "Purchase order created successfully", zap.Any("purchase order", dto.NewCreatePurchaseOrderResponse(createdPurchaseOrder)))

}
