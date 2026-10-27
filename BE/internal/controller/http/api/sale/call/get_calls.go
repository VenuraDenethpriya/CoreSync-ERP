package call

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/middleware"
	"CoreSync-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (c *CallHandler) GetCalls(ctx *gin.Context) {
	logger.Info(ctx, "Get calls request received")

	var searchParams dto.GetCallRequest
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}

	var clerkID, userRole, userEmail string
	if userCtx, exists := ctx.Get(middleware.ContextKeyAuthenticatedUser); exists {
		if authUser, ok := userCtx.(*middleware.AuthenticatedUser); ok {
			clerkID = authUser.ID
			userRole = authUser.Role
			userEmail = authUser.Email
		}
	}

	calls, totalCalls, err := c.saleService.GetCalls(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset, userRole, clerkID, userEmail)
	if err != nil {
		logger.Error(ctx, "Error getting calls", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Calls retrieved", zap.Int("count", len(calls)))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetCallsResponses(calls, totalCalls))
}
