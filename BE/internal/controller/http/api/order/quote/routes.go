package quote

import (
	dto "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/customer"
	"CoreSync-backend/internal/service/order"

	"github.com/gin-gonic/gin"
)

// // OrderHandler represents the HTTP handler for order-related requests
type QuoteHandler struct {
	orderService    order.Service
	customerService customer.Service
}

// // NewOrderHandler creates a new OrderHandler with the given order service
func NewQuoteHandler(orderService order.Service, customerService customer.Service) *QuoteHandler {
	return &QuoteHandler{
		orderService:    orderService,
		customerService: customerService,
	}
}

func SetupQuoteRoutes(
	router *gin.RouterGroup,
	orderHandler *QuoteHandler,
	auditSvc auditlogs.Service,
) {
	quote := router.Group("/quotes")
	{
		// Routes requiring SUPER_ADMIN role
		authorizationRouter := quote.Group("")

		authorizationRouter.POST("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			orderHandler.CreateQuote,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			orderHandler.GetQuotes,
		)

		authorizationRouter.GET("/:quote-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			orderHandler.GetQuoteByID,
		)
		authorizationRouter.DELETE("/:quote-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD)),
			orderHandler.DeleteQuote,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.PUT("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			orderHandler.UpdateQuoteStatus,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/quote-no",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.READ_ONLY)),
			orderHandler.GetLastQuoteNo,
		)
		authorizationRouter.PUT("/:quote-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			orderHandler.UpdateQuote,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/type",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			orderHandler.GetQuoteType,
		)
		authorizationRouter.GET("/quote-all",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.READ_ONLY)),
			orderHandler.GetAllQuotesDetails,
		)
	}

}
