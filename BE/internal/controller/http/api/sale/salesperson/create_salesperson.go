package salesperson

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (sh *SalepersonHandler) CreateSalesperson(ctx *gin.Context) {
	logger.Info(ctx, "Create salesperson request received")

	var req dto.CreateSalespersonRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Error(ctx, "Failed to bind create salesperson request")
		common.ValidationError(ctx, err)
		return
	}
	salesperson := mapper.SalespersonRequestToDomain(&req)
	actingClerkID := ctx.GetString("user_id")
	createdSalesperson, actorName, err := sh.saleService.CreateSalesperson(ctx, salesperson, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Salesperson created"},
		Description: fmt.Sprintf("%s created a new Salesperson %s %s", actorName, createdSalesperson.FirstName, createdSalesperson.LastName),
	})
	logger.Info(ctx, "Salesperson created", zap.Any("salesperson", createdSalesperson))
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewCreateSalespersonResponse(createdSalesperson))
}
