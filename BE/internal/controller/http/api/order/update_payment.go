package order

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *OrderHandler) UpdateOrderPayment(c *gin.Context) {
	logger.Info(c, "Update order payment request received")

	var req dto.UpdatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error(c, "Error binding request body", zap.Any("error", err))
		common.HandleError(c, fmt.Errorf("Error binding request body"))
		return
	}
	actingClerkID := c.GetString("user_id")
	updatePayment := mapper.UpdatePayment(&req)
	updatePayemntData, actorName, err := h.orderService.UpdatePayment(c, updatePayment, actingClerkID)
	if err != nil {
		logger.Error(c, "Error updating order payment", zap.Any("error", err))
		common.HandleError(c, err)
		return
	}
	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers: map[string]string{"X-Response-Message": "Payment status updated"},
		Description: fmt.Sprintf("%s %s LKR %.2f payment for %s%s",
			actorName,
			updatePayemntData.Status,
			updatePayemntData.Amount,
			updatePayemntData.Order.Type,
			updatePayemntData.Order.OrderNo,
		),
	})
	logger.Info(c, "Order payment updated", zap.Any("payment", updatePayemntData))
	common.HandleSuccess(c, common.StatusOK, dto.NewUpdatePaymentResponse(updatePayemntData))
}
