package user

import (
	"fmt"
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/google/uuid"

	"rims-backend/internal/service/domain"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *UserHandler) DeleteUser(c *gin.Context) {
	logger.Info(c, "Delete user request received")
	var uri dto.DeleteUserIdRequest
	if err := c.ShouldBindUri(&uri); err != nil {
		logger.Error(c, "Failed to bind request", zap.Error(err))
		common.ValidationError(c, err)
		return
	}
	userUUID, err := uuid.Parse(uri.UserID)
	if err != nil {
		logger.Error(c, "Invalid UUID format", zap.Error(err))
		common.ValidationError(c, err)
		return
	}
	var user domain.User
	user.ID = userUUID
	actingClerkID := c.GetString("user_id")

	deleteUser, actorName, err := ch.userService.DeleteUser(c, &user, actingClerkID)
	if err != nil {
		logger.Error(c, "Failed to delete user", zap.Error(err))
		common.HandleError(c, err)
		return
	}

	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers: map[string]string{"X-Response-Message": "User deleted"},
		Description: fmt.Sprintf("%s deleted user %s %s",
			actorName, deleteUser.FirstName, deleteUser.LastName),
	})

	logger.Info(c, "User deleted", zap.Any("user", deleteUser))
	common.HandleSuccess(c, common.StatusOK, dto.NewDeleteUserResponse(deleteUser))
}
