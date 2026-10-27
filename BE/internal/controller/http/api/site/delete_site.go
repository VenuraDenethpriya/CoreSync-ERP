package site

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/events"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service/domain"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

func (th *SiteHandler) DeleteSite(ctx *gin.Context) {
	logger.Info(ctx, "Delete site request received")
	var uri dto.DeleteSiteRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.SiteID)
	logger.Info(ctx, "Parsed UUID", zap.String("site-id", uri.SiteID), zap.Any("parsed-uuid", parsedUUID))
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var site domain.Site
	site.ID = parsedUUID

	actingClerkID := ctx.GetString("user_id")
	deleteSite, actorName, err := th.siteService.DeleteSite(ctx, &site, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Site deleted"},
		Description: fmt.Sprintf("%s deleted a site %s", actorName),
	})
	logger.Info(ctx, "Site deleted", zap.Any("site", deleteSite))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewDeleteSiteResponse(deleteSite))
	go th.bus.Publish("sites", events.Event{
		Type: "site.deleted",
		Data: deleteSite,
	})
}
