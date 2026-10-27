package site

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (sh *SiteHandler) GetSites(ctx *gin.Context) {
	logger.Info(ctx, "Get sites request received")

	var searchParams dto.GetSiteRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}
	getSites, totalSites, err := sh.siteService.GetSites(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting sits", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Sites retrieved", zap.Any("sits", getSites))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetSiteResponse(getSites, totalSites))
}
