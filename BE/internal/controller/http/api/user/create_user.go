package user

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *UserHandler) CreateUser(ctx *gin.Context) {
	logger.Info(ctx, "Create user request received")
	var req dto.CreateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		common.ValidationError(ctx, err)
		logger.Error(ctx, "Failed to bind request", zap.Error(err))
		return
	}
	logger.Info(ctx, "CreateUserRequest payload", zap.Any("req", req))
	user := mapper.UserRequestToDomain(&req)
	logger.Info(ctx, "Mapped user", zap.Any("user", user))

	createUser, err := ch.userService.CreateUser(ctx, user)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Failed to create user", zap.Error(err))
		return
	}
	common.SetAuditInfo(ctx, common.AuditLogDetails{
		Headers: map[string]string{"X-Response-Message": "User created"},
		Description: fmt.Sprintf("%s created a new user %s %s",
			createUser.CreatedBy, createUser.FirstName, createUser.LastName),
	})
	logger.Info(ctx, "User created", zap.Any("user", createUser))
	common.HandleSuccess(ctx, common.StatusCreated, dto.NewCreateUserResponse(createUser))
}
