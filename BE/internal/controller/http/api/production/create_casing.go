package production

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"
	"strings"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *ProductionHandler) CreateCasing(c *gin.Context) {
	logger.Info(c, "Creating new casing request received")

	var req dto.CreateCasingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error(c, "Failed to bind request")
		common.ValidationError(c, err)
		return
	}

	baseCasing := mapper.CasingRequestToDomain(&req)

	createdCasings, err := h.productionService.CreateCasings(c, baseCasing, req.Quantity)
	if err != nil {
		logger.Error(c, "Failed to create casings", zap.Error(err))
		common.HandleError(c, err)
		return
	}

	var createdIDs []uuid.UUID
	var productName string
	var userName string

	if len(createdCasings) > 0 {
		productName = createdCasings[0].Product.Name
		userName = createdCasings[0].CreatedBy
		if createdCasings[0].User != nil {
			userName = strings.TCoreSyncpace(createdCasings[0].User.FirstName + " " + createdCasings[0].User.LastName)
		}

		for _, casing := range createdCasings {
			createdIDs = append(createdIDs, casing.ID)
		}
	}

	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Casings created"},
		Description: fmt.Sprintf("%s created %d new Casing(s) for Product: %s", userName, req.Quantity, productName),
	})

	logger.Info(c, "Casings created successfully", zap.Int("count", len(createdCasings)))
	common.HandleSuccess(c, common.StatusCreated, dto.NewCreateCasingResponse(createdIDs))
}
