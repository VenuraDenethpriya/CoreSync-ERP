package inventory

import (
	stockcontrolapi "CoreSync-backend/internal/controller/http/api/stockcontrol" // [ADDED 2026-10-13]
	dto "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/inventory"

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
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			inventoryHandler.CreateInventory,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			inventoryHandler.GetInventory,
		)
		authorizationRouter.PUT("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF)),
			inventoryHandler.UpdateInventory,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.DELETE("/:item-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			inventoryHandler.DeleteInventory,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/:item-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			inventoryHandler.GetInventoryById,
		)
		authorizationRouter.POST("/usage",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF)),
			stockcontrolapi.BlockWhenEnabled("Manual usage entry"), // [ADDED 2026-10-13]
			inventoryHandler.CreateInventoryItemUsage,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/usage",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			inventoryHandler.GetInventoryItemUsage,
		)
		authorizationRouter.DELETE("/usage",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF)),
			stockcontrolapi.BlockWhenEnabled("Deleting usage records"), // [ADDED 2026-10-13]
			inventoryHandler.DeleteInventoryItemUsage,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.PUT("/usage",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF)),
			stockcontrolapi.BlockWhenEnabled("Editing usage records"), // [ADDED 2026-10-13]
			inventoryHandler.UpdateInventoryItemUsage,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/nonresellable",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			inventoryHandler.GetNonResellableInventory,
		)
		authorizationRouter.POST("/restock",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF)),
			stockcontrolapi.BlockWhenEnabled("Manual restock"), // [ADDED 2026-10-13]
			inventoryHandler.CreateInventoryItemRestock,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/restock/:item-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			inventoryHandler.GetInventoryItemRestock,
		)
		authorizationRouter.POST("/allocation",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			stockcontrolapi.BlockWhenEnabled("Manual allocation"), // [ADDED 2026-10-13]
			inventoryHandler.CreateInventoryItemAllocation,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/allocation",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			inventoryHandler.GetInventoryItemAllocation,
		)
		authorizationRouter.DELETE("/allocation",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER)),
			stockcontrolapi.BlockWhenEnabled("Removing allocations by hand"), // [ADDED 2026-10-13]
			inventoryHandler.DeleteInventoryItemAllocation,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.PUT("/allocation",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER)),
			stockcontrolapi.BlockWhenEnabled("Editing allocations by hand"), // [ADDED 2026-10-13]
			inventoryHandler.UpdateInventoryItemAllocation,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/item",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF), string(dto.READ_ONLY)),
			inventoryHandler.GetInventoryItemByCode,
		)
		authorizationRouter.PUT("/restock",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER)),
			inventoryHandler.UpdateInventoryItemRestockPrintStatus,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.POST("/order",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			stockcontrolapi.BlockWhenEnabled("Creating stock orders outside purchase requests"), // [ADDED 2026-10-13]
			inventoryHandler.CreateInventoryOrders,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/orders",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF), string(dto.READ_ONLY)),
			inventoryHandler.GetInventoryOrders,
		)
		authorizationRouter.DELETE("/orders/:order-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			inventoryHandler.DeleteInventoryOrder,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.PUT("/orders",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF)),
			inventoryHandler.UpdateInventoryOrder,
			middleware.AuditMiddleware(auditSvc),
		)
		authorizationRouter.GET("/orders/received",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF), string(dto.READ_ONLY)),
			inventoryHandler.GetInventoryReceivedOrders,
		)
		authorizationRouter.POST("/orders/received",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			stockcontrolapi.BlockWhenEnabled("Receiving goods without a purchase request"), // [ADDED 2026-10-13]
			inventoryHandler.CreateInventoryFromOrders,
			middleware.AuditMiddleware(auditSvc),
		)
	}
}
