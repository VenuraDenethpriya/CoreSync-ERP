package product

import (
	"rims-backend/internal/controller/http/middleware"
	auditlogs "rims-backend/internal/service/audit_logs"
	"rims-backend/internal/service/product"

	"github.com/gin-gonic/gin"
)

// ProductHandler represents the HTTP handler for product-related requests
type ProductHandler struct {
	productService product.Service
}

// NewProductHandler creates a new ProductHandler instance
func NewProductHandler(svc product.Service) *ProductHandler {
	return &ProductHandler{
		svc,
	}
}

func SetupProductRoutes(
	router *gin.RouterGroup,
	productHandler *ProductHandler,
	auditSvc auditlogs.Service,
) {
	product := router.Group("/products")
	{

		authorizationRouter := product.Group("")

		authorizationRouter.POST("",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			productHandler.CreateProduct,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.PUT("/:product-id",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			productHandler.UpdateProduct,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.DELETE("/:product-id",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			productHandler.DeleteProduct,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/:product-id",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF)),
			productHandler.GetProductByID,
		)
		authorizationRouter.GET("",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			productHandler.GetProducts,
		)

		authorizationRouter.GET("/basic-info",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			productHandler.GetBasicProductInfo,
		)
	}
}
