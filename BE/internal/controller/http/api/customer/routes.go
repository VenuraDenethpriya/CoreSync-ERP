package customer

import (
	dto "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/customer"

	"github.com/gin-gonic/gin"
)

// CustomerHandler represents the HTTP handler for customer-related requests
type CustomerHandler struct {
	customerService customer.Service
}

// NewCustomerHandler creates a new CustomerHandler instance
func NewCustomerHandler(svc customer.Service) *CustomerHandler {
	return &CustomerHandler{
		svc,
	}
}

func SetupCustomerRoutes(
	router *gin.RouterGroup,
	customerHandler *CustomerHandler,
	auditSvc auditlogs.Service,
) {
	customers := router.Group("/customers")
	{
		authorizationRouter := customers.Group("")

		authorizationRouter.POST("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD)),
			customerHandler.CreateCustomer,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/:customerId",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			customerHandler.GetCustomerByID,
		)
		authorizationRouter.GET("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			customerHandler.GetCustomers,
		)
		authorizationRouter.GET("/table",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.READ_ONLY)),
			customerHandler.GetCustomersTableData,
		)
		authorizationRouter.PUT("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD)),
			customerHandler.UpdateCustomer,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.DELETE("/:customer-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD)),
			customerHandler.DeleteCustomer,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/search",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			customerHandler.SearchCustomers,
		)
		authorizationRouter.GET("/phone/:phoneNo",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF), string(dto.READ_ONLY)),
			customerHandler.GetCustomerByPhoneNo,
		)
	}
}
