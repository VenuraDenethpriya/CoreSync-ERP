package order

import (
	"CoreSync-backend/internal/controller/http/api/order/quote"
	dto "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	"CoreSync-backend/internal/events"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/customer"
	"CoreSync-backend/internal/service/inventory"
	"CoreSync-backend/internal/service/order"
	"CoreSync-backend/internal/service/product"
	"CoreSync-backend/pkg/sms"

	"github.com/gin-gonic/gin"
)

// OrderHandler represents the HTTP handler for order-related requests
type OrderHandler struct {
	orderService     order.Service
	customerService  customer.Service
	productService   product.Service
	bus              *events.EventBus
	smsService       sms.Sender
	inventoryService inventory.Service
}

// NewOrderHandler creates a new OrderHandler with the given order service
func NewOrderHandler(orderService order.Service, customerService customer.Service, productService product.Service, bus *events.EventBus, smsService sms.Sender, inventoryService inventory.Service) *OrderHandler {
	return &OrderHandler{
		orderService:     orderService,
		customerService:  customerService,
		productService:   productService,
		bus:              bus,
		smsService:       smsService,
		inventoryService: inventoryService,
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
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			orderHandler.CreateOrder,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/type",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.READ_ONLY)),
			orderHandler.GetLastOrderType,
		)
		authorizationRouter.GET((""),
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			orderHandler.GetAllOrders,
		)
		authorizationRouter.PUT("/:order-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER), string(dto.FINANCE_HEAD)),
			orderHandler.UpdateOrder,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.PUT("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER)),
			orderHandler.UpdateOrderStatus,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/:order-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			orderHandler.GetOrderById,
		)
		authorizationRouter.DELETE("/:order-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD)),
			orderHandler.DeleteOrder,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET(("/drafted"),
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			orderHandler.GetAllDraftedOrders,
		)
		authorizationRouter.PUT(("/approvel/:order-id"),
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER)),
			orderHandler.ApproveOrder,
			middleware.AuditMiddleware(auditSvc),
		)

		authorizationRouter.GET(("/cad-files"),
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER), string(dto.READ_ONLY)),
			orderHandler.GetCADFiles,
		)
		authorizationRouter.GET(("/card"),
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF), string(dto.READ_ONLY)),
			orderHandler.GetCardOrders,
		)
		authorizationRouter.PUT(("/refund"),
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			orderHandler.PaymentRefund,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET(("/packs"),
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER), string(dto.SALES_TEAM), string(dto.WAREHOUSE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			orderHandler.GetAllPacks,
		)
		authorizationRouter.GET(("/pack/:pack-id"),
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER), string(dto.SALES_TEAM), string(dto.WAREHOUSE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			orderHandler.GetPackByID,
		)
		authorizationRouter.PUT(("/pack"),
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER), string(dto.SALES_TEAM)),
			orderHandler.UpdatePack,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.PUT(("/pack/order-no"),
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER)),
			orderHandler.UpdatePackOrderNo,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.POST(("/pack"),
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER)),
			orderHandler.CreatePack,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET(("/payments"),
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			orderHandler.GetOrderPaymentList,
		)
		authorizationRouter.PUT(("/payment"),
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD)),
			orderHandler.UpdateOrderPayment,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.PUT(("/pack/production"),
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.INVENTORY_MANAGER)),
			orderHandler.UpdatePackProduction,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.DELETE("/pack/:pack-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER)),
			orderHandler.DeletePack,
			middleware.AuditMiddleware(auditSvc),
		)
	}
}
