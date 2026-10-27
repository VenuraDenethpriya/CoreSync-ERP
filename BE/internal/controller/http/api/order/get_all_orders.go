package order

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/middleware"
	"CoreSync-backend/internal/helper/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (ch *OrderHandler) GetAllOrders(ctx *gin.Context) {
	logger.Info(ctx, "Get all orders request recived")

	var searchParams dto.GetOrdersRequest
	if err := ctx.ShouldBindQuery(&searchParams); err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error parsing search params", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Order search params", zap.Any("order_search_params", searchParams))

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
	orders, totalOrders, err := ch.orderService.GetAllOrders(ctx, searchParams.Query, searchParams.Limit, searchParams.Offset, searchParams.Vat, searchParams.OrderStatus, searchParams.PaymentStatus, userRole, clerkID, userEmail)
	if err != nil {
		common.HandleError(ctx, err)
		logger.Error(ctx, "Error getting orders", zap.Any("error", err))
		return
	}
	logger.Info(ctx, "Orders fetched", zap.Any("orders", orders))
	common.HandleSuccess(ctx, common.StatusOK, dto.NewGetAllOrdersResponse(orders, totalOrders))
}
