package order

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service/domain"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (oh *OrderHandler) GetPackByID(ctx *gin.Context) {
	logger.Info(ctx, "Get pack by id request received")
	var uri dto.GetPackByIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	parsedID, err := uuid.Parse(uri.PackID)
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var pack domain.OrderItem
	pack.ID = parsedID
	getPack, err := oh.orderService.GetPackByID(ctx, &pack)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.HandleSuccess(ctx, common.StatusAccepted, dto.NewGetPackByIdResponse(getPack))
}
