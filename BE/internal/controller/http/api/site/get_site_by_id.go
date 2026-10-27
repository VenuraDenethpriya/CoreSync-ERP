package site

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service/domain"
	"fmt"

	"github.com/google/uuid"

	"github.com/gin-gonic/gin"
)

func (h *SiteHandler) GetSiteById(ctx *gin.Context) {
	logger.Info(ctx, "GetSiteByID request received")
	var uri dto.GetSiteIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		common.ValidationError(ctx, err)
		return
	}
	parsedUUID, err := uuid.Parse(uri.ID)
	if err != nil {
		common.HandleError(ctx, fmt.Errorf("invalid UUID: %v", err))
		return
	}
	var site domain.Site
	site.ID = parsedUUID
	getSite, err := h.siteService.GetSiteByID(ctx, &site)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetSiteByIdResponse(getSite))
}
