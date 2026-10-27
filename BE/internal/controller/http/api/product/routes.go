package product

import (
	dto "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/product"

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
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			productHandler.CreateProduct,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.PUT("/:product-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			productHandler.UpdateProduct,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.DELETE("/:product-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			productHandler.DeleteProduct,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/:product-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			productHandler.GetProductByID,
		)
		authorizationRouter.GET("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			productHandler.GetProducts,
		)

		authorizationRouter.GET("/basic-info",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.READ_ONLY)),
			productHandler.GetBasicProductInfo,
		)
		authorizationRouter.POST("/bom",
			middleware.ClerkAuthMiddleware(),
			// [CHANGED 2026-10-13] BOM edits: Admins and Super Admins only (was also Inventory Manager, Office Staff)
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD)),
			productHandler.CreateProductBom,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/bom/:product-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			productHandler.GetProductBomByID,
		)
		authorizationRouter.DELETE("/bom/:product-bom-id",
			middleware.ClerkAuthMiddleware(),
			// [CHANGED 2026-10-13] BOM edits: Admins and Super Admins only (was also Inventory Manager, Office Staff)
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD)),
			productHandler.DeleteProductBom,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.PUT("/bom/:product-bom-id",
			middleware.ClerkAuthMiddleware(),
			// [CHANGED 2026-10-13] BOM edits: Admins and Super Admins only (was also Inventory Manager, Office Staff)
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD)),
			productHandler.UpdateProductBom,
			middleware.AuditMiddleware(auditSvc),
		)
	}
}
