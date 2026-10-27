package quote

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/middleware"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *QuoteHandler) GetQuotes(ctx *gin.Context) {
	logger.Info(ctx, "Get quotes request recived")

	var searchParams dto.GetQuotesRequest

	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(ctx, "Error binding query parameters", zap.Any("error", err))
		common.ValidationError(ctx, err)
		return
	}

	var clerkID, userRole, userEmail string
	if userCtx, exists := ctx.Get(middleware.ContextKeyAuthenticatedUser); exists {
		if authUser, ok := userCtx.(*middleware.AuthenticatedUser); ok {
			clerkID = authUser.ID
			userRole = authUser.Role
			userEmail = authUser.Email
		} else {
			logger.Error(ctx, "Failed to cast authenticated_user from context")
		}
	} else {
		logger.Error(ctx, "authenticated_user not found in context")
	}
	fmt.Printf("DEBUG => Extracted -> Role: '%s', Email: '%s', ClerkID: '%s'\n", userRole, userEmail, clerkID)

	quotes, totalQuotes, err := ch.orderService.GetQuotes(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset, userRole, clerkID, userEmail)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error getting quotes", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Quotes fetched", zap.Any("quotes", quotes))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetQuotesResponse(quotes, totalQuotes))
}
