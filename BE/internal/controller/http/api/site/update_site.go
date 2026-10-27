package site

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/events"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (sh *SiteHandler) UpdateSite(ctx *gin.Context) {
	logger.Info(ctx, "Update site request received")
	var req dto.UpdateSiteRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		return
	}

	site := mapper.UpdateSiteRequestToDomain(&req)

	actingClerkID := ctx.GetString("user_id")
	updateSite, actorName, err := sh.siteService.UpdateSite(ctx, site, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Site updated"},
		Description: fmt.Sprintf("%s updated a site", actorName),
	})
	logger.Info(ctx, "Site updated successfully", zap.Any("task-id", updateSite.ID))
	common.HandleSuccess(ctx, common.StatusAccepted, dto.NewUpdateSiteResponse(updateSite))
	go sh.bus.Publish("sites", events.Event{
		Type: "site.updated",
		Data: updateSite,
	})
}
