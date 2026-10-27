package finance

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service/domain"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (fh *FinanceHandler) GetPurchaseOrderById(ctx *gin.Context) {
	logger.Info(ctx, "Purchae order by id request received")

	var uri dto.GetPurchaseOrderIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	parsedUUID, err := uuid.Parse(uri.ID)
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}

	var purchaseOrder domain.Finance
	purchaseOrder.ID = parsedUUID

	getPurchaseOrder, err := fh.financeService.GetPurchaseOrderByID(ctx, &purchaseOrder)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetPurchaseOrderIdResponse(getPurchaseOrder))
}
