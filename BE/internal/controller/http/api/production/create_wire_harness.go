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

func (h *ProductionHandler) CreateWireHarness(c *gin.Context) {
	logger.Info(c, "Creating new wire harness request received")

	var req dto.CreateWireHarnessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error(c, "Failed to bind request")
		common.ValidationError(c, err)
		return
	}

	baseWireHarness := mapper.WireHarnessRequestToDomain(&req)

	createdWireHarness, err := h.productionService.CreateWireHarness(c, baseWireHarness, req.Quantity)
	if err != nil {
		logger.Error(c, "Failed to create wire harness", zap.Error(err))
		common.HandleError(c, err)
		return
	}

	var createdIDs []uuid.UUID
	var productName string
	var userName string

	if len(createdWireHarness) > 0 {
		productName = createdWireHarness[0].Product.Name
		userName = createdWireHarness[0].CreatedBy
		if createdWireHarness[0].User != nil {
			userName = strings.TrimSpace(createdWireHarness[0].User.FirstName + " " + createdWireHarness[0].User.LastName)
		}

		for _, casing := range createdWireHarness {
			createdIDs = append(createdIDs, casing.ID)
		}
	}

	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Wire Harness created"},
		Description: fmt.Sprintf("%s created %d new Casing(s) for Product: %s", userName, req.Quantity, productName),
	})

	logger.Info(c, "Wire harness created successfully", zap.Int("count", len(createdWireHarness)))
	common.HandleSuccess(c, common.StatusCreated, dto.NewCreateWireHarnessResponse(createdIDs))
}
