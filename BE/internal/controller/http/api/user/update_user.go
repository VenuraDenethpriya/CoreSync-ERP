package user

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/controller/http/mapper"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *UserHandler) UpdateUser(ctx *gin.Context) {
	logger.Info(ctx, "Update user request received")
	var req dto.UpdateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	user := mapper.UpdateUserRequestToDomain(&req)
	actingClerkID := ctx.GetString("user_id")
	updateUser, actorName, err := ch.userService.UpdateUser(ctx, user, actingClerkID)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to update user", zap.Error(err))
		return
	}

	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers: map[string]string{"X-Response-Message": "User updated"},
		Description: fmt.Sprintf("%s updated user %s %s",
			actorName, updateUser.FirstName, updateUser.LastName),
	})
	logger.Info(ctx, "User updated", zap.Any("user", updateUser))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewUpdateUserResponse(updateUser))
}
