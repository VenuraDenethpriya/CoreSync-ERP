package inventory

import (
	"rims-backend/internal/controller/http/middleware"
	auditlogs "rims-backend/internal/service/audit_logs"
	"rims-backend/internal/service/inventory"

	"github.com/gin-gonic/gin"
)

type InventoryHandler struct {
	inventoryService inventory.Service
}

func NewInventoryHandler(svc inventory.Service) *InventoryHandler {
	return &InventoryHandler{
		inventoryService: svc,
	}
}

func SetupInventoryRoutes(
	router *gin.RouterGroup,
	inventoryHandler *InventoryHandler,
	auditSvc auditlogs.Service,
) {
	inventory := router.Group("/inventory")
	{
		authorizationRouter := inventory.Group("")

		authorizationRouter.POST("",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			inventoryHandler.CreateInventory,
			middleware.AuditMiddleware(auditSvc),
		)

		authorizationRouter.GET("",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF)),
			inventoryHandler.GetInventory,
		)
		authorizationRouter.PUT("",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF)),
			inventoryHandler.UpdateInventory,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.DELETE("/:item-id",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			inventoryHandler.DeleteInventory,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/:item-id",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			inventoryHandler.GetInventoryById,
		)
		authorizationRouter.POST("/usage",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF)),
			inventoryHandler.CreateInventoryItemUsage,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/usage",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF)),
			inventoryHandler.GetInventoryItemUsage,
		)
		authorizationRouter.DELETE("/usage",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF)),
			inventoryHandler.DeleteInventoryItemUsage,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.PUT("/usage",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF)),
			inventoryHandler.UpdateInventoryItemUsage,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/nonresellable",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			inventoryHandler.GetNonResellableInventory,
		)
		authorizationRouter.POST("/restock",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF)),
			inventoryHandler.CreateInventoryItemRestock,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/restock/:item-id",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			inventoryHandler.GetInventoryItemRestock,
		)
		authorizationRouter.POST("/allocation",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			inventoryHandler.CreateInventoryItemAllocation,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/allocation",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF)),
			inventoryHandler.GetInventoryItemAllocation,
		)
		authorizationRouter.DELETE("/allocation",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER)),
			inventoryHandler.DeleteInventoryItemAllocation,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.PUT("/allocation",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER)),
			inventoryHandler.UpdateInventoryItemAllocation,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/item",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF)),
			inventoryHandler.GetInventoryItemByCode,
		)
		authorizationRouter.PUT("/restock",
			// middleware.ClerkAuthMiddleware(),
			// middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER)),
			inventoryHandler.UpdateInventoryItemRestockPrintStatus,
			middleware.AuditMiddleware(auditSvc),
		)
	}
}
