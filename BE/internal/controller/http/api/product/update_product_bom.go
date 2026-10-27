package product

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (ph *ProductHandler) UpdateProductBom(c *gin.Context) {
	logger.Info(c, "Update product BOM request received")
	var req dto.UpdateProductBomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error(c, "Error binding JSON: %v", zap.Error(err))
		common.ValidationError(c, err)
		return
	}
	passedUUID, err := uuid.Parse(req.ID)
	logger.Info(c, "Parsed UUID", zap.String("bom-id", req.ID), zap.Any("parsed-uuid", passedUUID))
	if err != nil {
		logger.Error(c, "Error parsing UUID", zap.Error(err))
		common.HandleError(c, err)
		return
	}
	bom := mapper.UpdateProductBomRequestToDomain(&req)
	bom.ID = passedUUID
	actingClerkID := c.GetString("user_id")
	updatedBom, actorName, err := ph.productService.UpdateProductBom(c, bom, actingClerkID)
	if err != nil {
		logger.Error(c, "Error updating product BOM", zap.Error(err))
		common.HandleError(c, err)
		return
	}
	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Product BOM updated"},
		Description: fmt.Sprintf("%s updated the BOM no %s", actorName, updatedBom.Inventory.ItemName),
	})
	logger.Info(c, "Product BOM updated", zap.Any("bom", updatedBom))
	common.HandleSuccess(c, common.StatusOK, dto.NewUpdateProductBomResponse(updatedBom))
}
