package user

import (
	dto "rims-backend/internal/controller/http/dto/const"
	"rims-backend/internal/controller/http/middleware"
	auditlogs "rims-backend/internal/service/audit_logs"
	"rims-backend/internal/service/user"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService user.Service
}

func NewUserHandler(svc user.Service) *UserHandler {
	return &UserHandler{
		userService: svc,
	}
}
func SetupUserRoutes(
	router *gin.RouterGroup,
	userHandler *UserHandler,
	auditSvc auditlogs.Service,
) {
	user := router.Group("/users")
	{
		adminUser := user.Group("")

		adminUser.POST("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN)),
			userHandler.CreateUser,
			middleware.AuditMiddleware(auditSvc),
		)
		adminUser.GET("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.INVENTORY_MANAGER)),
			userHandler.GetUsers,
		)
		adminUser.PUT("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN)),
			userHandler.UpdateUser,
			middleware.AuditMiddleware(auditSvc),
		)
		adminUser.DELETE("/:user-id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN)),
			userHandler.DeleteUser,
			middleware.AuditMiddleware(auditSvc),
		)
		adminUser.POST("/clerk/create-user",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN)),
			userHandler.CreateClerkUser,
		)
		adminUser.PATCH("/clerk/update-user",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN)),
			userHandler.UpdateClerkUser,
		)
	}
}
