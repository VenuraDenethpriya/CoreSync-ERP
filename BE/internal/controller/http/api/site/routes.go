package site

import (
	dto "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	"CoreSync-backend/internal/events"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/site"
	"CoreSync-backend/internal/service/user"
	"CoreSync-backend/pkg/sms"

	"github.com/gin-gonic/gin"
)

type SiteHandler struct {
	siteService site.Service
	userService user.Service
	bus         *events.EventBus
	smsService  sms.Sender
}

func NewSiteHandler(svc site.Service, userService user.Service, bus *events.EventBus, smsService sms.Sender) *SiteHandler {
	return &SiteHandler{
		siteService: svc,
		userService: userService,
		bus:         bus,
		smsService:  smsService,
	}
}

func SetupSiteRoutes(router *gin.RouterGroup, siteHandler *SiteHandler, auditSvc auditlogs.Service,
) {
	site := router.Group("sites")
	{
		adminSite := site.Group("")

		adminSite.POST("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF)),
			siteHandler.CreateSite,
			middleware.AuditMiddleware(auditSvc),
		)
		adminSite.GET("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			siteHandler.GetSites,
		)
		adminSite.GET(":siteId",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			siteHandler.GetSiteById,
		)
		adminSite.DELETE(":siteId",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER)),
			siteHandler.DeleteSite,
			middleware.AuditMiddleware(auditSvc),
		)
		adminSite.PUT("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER)),
			siteHandler.UpdateSite,
			middleware.AuditMiddleware(auditSvc),
		)
	}
}
