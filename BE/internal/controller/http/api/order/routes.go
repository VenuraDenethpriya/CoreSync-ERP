package order

import (
	"rims-backend/internal/controller/http/api/order/quote"
	"rims-backend/internal/controller/http/middleware"
	"rims-backend/internal/events"
	auditlogs "rims-backend/internal/service/audit_logs"
	"rims-backend/internal/service/customer"
	"rims-backend/internal/service/order"
	"rims-backend/pkg/sms"

	"github.com/gin-gonic/gin"
)

// OrderHandler represents the HTTP handler for order-related requests
type OrderHandler struct {
	orderService    order.Service
	customerService customer.Service
	bus             *events.EventBus
	smsService      sms.Sender
}

// NewOrderHandler creates a new OrderHandler with the given order service
func NewOrderHandler(orderService order.Service, customerService customer.Service, bus *events.EventBus, smsService sms.Sender) *OrderHandler {
	return &OrderHandler{
		orderService:    orderService,
		customerService: customerService,
		bus:             bus,
		smsService:      smsService,
	}
}

func SetupOrderRoutes(
	router *gin.RouterGroup,
	orderHandler *OrderHandler,
	quoteHandler *quote.QuoteHandler,
	auditSvc auditlogs.Service) {
	order := router.Group("/orders")
	{
		authorizationRouter := order.Group("")

		quote.SetupQuoteRoutes(order, quoteHandler, auditSvc)

		authorizationRouter.POST("",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			orderHandler.CreateOrder,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/type",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			orderHandler.GetLastOrderType,
		)
		authorizationRouter.GET((""),
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF)),
			orderHandler.GetAllOrders,
		)
		authorizationRouter.PUT("/:order-id",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER)),
			orderHandler.UpdateOrder,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.PUT("",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER)),
			orderHandler.UpdateOrderStatus,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/:order-id",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF)),
			orderHandler.GetOrderById,
		)
		authorizationRouter.DELETE("/:order-id",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD)),
			orderHandler.DeleteOrder,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET(("/drafted"),
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER)),
			orderHandler.GetAllDraftedOrders,
		)
		authorizationRouter.PUT(("/approvel/:order-id"),
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER)),
			orderHandler.ApproveOrder,
			middleware.AuditMiddleware(auditSvc),
		)

		authorizationRouter.GET(("/cad-files"),
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER)),
			orderHandler.GetCADFiles,
		)
		authorizationRouter.GET(("/card"),
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF)),
			orderHandler.GetCardOrders,
		)
		authorizationRouter.PUT(("/refund"),
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			orderHandler.PaymentRefund,
			middleware.AuditMiddleware(auditSvc),
		)
	}
}
