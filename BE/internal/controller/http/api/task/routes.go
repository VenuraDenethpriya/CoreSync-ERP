package task

import (
	dto "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	"CoreSync-backend/internal/events"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/task"

	"github.com/gin-gonic/gin"
)

type TaskHandler struct {
	taskService task.Service
	bus         *events.EventBus
}

func NewTaskHandler(svc task.Service, bus *events.EventBus) *TaskHandler {
	return &TaskHandler{
		taskService: svc,
		bus:         bus,
	}
}
func SetupTaskRoutes(
	router *gin.RouterGroup,
	taskHandler *TaskHandler,
	auditSvc auditlogs.Service,
) {
	task := router.Group("/tasks")
	{
		adminTask := task.Group("")

		adminTask.POST("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER)),
			taskHandler.CreateTask,
			middleware.AuditMiddleware(auditSvc),
		)
		adminTask.GET("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			taskHandler.GetTasks,
		)
		adminTask.PUT("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER)),
			taskHandler.UpdateTask,
			middleware.AuditMiddleware(auditSvc),
		)
		adminTask.DELETE(":taskId",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER)),
			taskHandler.DeleteTask,
			middleware.AuditMiddleware(auditSvc),
		)
		adminTask.GET("/card",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.WAREHOUSE_STAFF), string(dto.READ_ONLY)),
			taskHandler.GetCardTasks,
		)
		adminTask.GET("/report",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.INVENTORY_MANAGER), string(dto.OFFICE_STAFF), string(dto.READ_ONLY)),
			taskHandler.GetTaskByDateOrAssignee,
		)
	}
}
