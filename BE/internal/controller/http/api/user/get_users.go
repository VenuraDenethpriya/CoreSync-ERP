package user

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *UserHandler) GetUsers(ctx *gin.Context) {
	logger.Info(ctx, "Get users request received")

	var searchParams dto.GetUserRequest
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	users, totalUsers, err := ch.userService.GetUsers(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset)
	if err != nil {
		logger.Error(ctx, "Error getting users", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Users retrieved", zap.Int("count", len(users)))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetUsersResponse(users, totalUsers))
}
