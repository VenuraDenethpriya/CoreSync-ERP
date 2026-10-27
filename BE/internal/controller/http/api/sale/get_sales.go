package sale

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/middleware"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (s *SaleHandler) GetSales(ctx *gin.Context) {
	logger.Info(ctx, "Get sales request received")

	var searchParams dto.GetSalesRequest
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
		} else {
			logger.Error(ctx, "Failed to cast authenticated_user from context")
		}
	} else {
		logger.Error(ctx, "authenticated_user not found in context")
	}
	fmt.Printf("DEBUG => Extracted -> Role: '%s', Email: '%s', ClerkID: '%s'\n", userRole, userEmail, clerkID)

	sales, totalSales, err := s.saleService.GetSales(ctx, searchParams.Query, searchParams.Status, searchParams.Limit, searchParams.Offset, userRole, clerkID, userEmail)
	if err != nil {
		logger.Error(ctx, "Error getting sales", zap.Any("error", err))
		common.HandleError(ctx, err)
		return
	}
	logger.Info(ctx, "Sales retrieved", zap.Int("count", len(sales)))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetSalesResponses(sales, totalSales))
}
