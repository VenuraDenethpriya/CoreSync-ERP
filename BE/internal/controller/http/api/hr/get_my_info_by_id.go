package hr

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (hh *HrHandler) GetMyInfoById(ctx *gin.Context) {
	logger.Info(ctx, "My info by id request received")

	var uri dto.GetMyInfoByIdRequest
	if err := ctx.ShouldBindUri(&uri); err != nil {
		logger.Error(ctx, "Error binding uri parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}

	getMyInfo, err := hh.hrService.GetMyInfoByID(ctx, uri.Email)
	if err != nil {
		common.HandleError(ctx, err)
		return
	}

	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetMyInfoByIdResponse(getMyInfo))
}
