package call

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *CallHandler) CreateCall(c *gin.Context) {
	logger.Info(c, "Create call request received")
	var req dto.CreateCallRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		logger.Error(c, "Failed to bind create call request", zap.Error(err))
		return
	}
	callDomain := mapper.CallRequestToDomain(&req)
	createdCall, err := ch.saleService.CreateCall(c, callDomain)
	if err != nil {
		common.HandleError(c, err)
		logger.Error(c, "Failed to create call", zap.Error(err))
		return
	}
	logger.Info(c, "Call created", zap.Any("call", createdCall))
	common.HandleSuccess(c, common.StatusOK, dto.NewCreateCallResponse(createdCall))
}
