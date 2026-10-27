package hr

import (
	dto "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/hr"
	"CoreSync-backend/internal/service/user"

	"github.com/gin-gonic/gin"
)

type HrHandler struct {
	hrService   hr.Service
	userService user.Service
}

func NewHrHandler(svc hr.Service, userService user.Service) *HrHandler {
	return &HrHandler{
		hrService:   svc,
		userService: userService,
	}
}
func SetupHrRoutes(router *gin.RouterGroup, hrHandler *HrHandler, auditSvc auditlogs.Service) {
	hr := router.Group("hr")
	{
		hr.POST("/talent-pool",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT)),
			hrHandler.CreateTalentPool,
			middleware.AuditMiddleware(auditSvc),
		)
		hr.GET("/talent-pool",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT), string(dto.READ_ONLY)),
			hrHandler.GetTalentPool,
		)
		hr.GET("/talent-pool/:talentPoolId",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT), string(dto.READ_ONLY)),
			hrHandler.GetTalentPoolById,
		)
		hr.PUT("/talent-pool",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT)),
			hrHandler.UpdateTalentPool,
			middleware.AuditMiddleware(auditSvc),
		)
		hr.GET("/interview-tracker",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT), string(dto.READ_ONLY)),
			hrHandler.GetInterviewTracker,
		)
		hr.GET("/interview-tracker/:interviewTrackerId",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT), string(dto.READ_ONLY)),
			hrHandler.GetInterviewTrackerById,
		)
		hr.DELETE("/interview-tracker/:id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT)),
			hrHandler.DeleteInterviewTracker,
			middleware.AuditMiddleware(auditSvc),
		)
		hr.POST("/employee",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT)),
			hrHandler.CreateEmployee,
			middleware.AuditMiddleware(auditSvc),
		)
		hr.GET("/employee",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT), string(dto.READ_ONLY)),
			hrHandler.GetEmployee,
		)
		hr.GET("/employee/:employeeId",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT), string(dto.READ_ONLY)),
			hrHandler.GetEmployeeById,
		)
		hr.DELETE("/employee/:employeeId",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT)),
			hrHandler.DeleteEmployee,
			middleware.AuditMiddleware(auditSvc),
		)
		hr.PUT("/employee",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT)),
			hrHandler.UpdateEmployee,
			middleware.AuditMiddleware(auditSvc),
		)
		hr.GET("/myinfo/:email",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT), string(dto.FINANCE_HEAD), string(dto.FINANCE_ASSISTANT), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF), string(dto.SALES_HEAD), string(dto.SALES_TEAM), string(dto.READ_ONLY)),
			hrHandler.GetMyInfoById,
		)
		hr.POST("/employee/request-leave",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT), string(dto.FINANCE_HEAD), string(dto.FINANCE_ASSISTANT), string(dto.INVENTORY_MANAGER), string(dto.WAREHOUSE_STAFF), string(dto.OFFICE_STAFF), string(dto.SALES_HEAD), string(dto.SALES_TEAM)),
			hrHandler.CreateLeaveRequest,
			middleware.AuditMiddleware(auditSvc),
		)
		hr.GET("/employee/request-leave",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT), string(dto.READ_ONLY)),
			hrHandler.GetLeaveRequests,
		)
		hr.PUT("/employee/request-leave",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT)),
			hrHandler.UpdateLeaveRequest,
			middleware.AuditMiddleware(auditSvc),
		)
		hr.GET("/employee/payroll",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT), string(dto.READ_ONLY)),
			hrHandler.GetPayrollEmployeeList,
		)
		hr.POST("/employee/payroll",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT)),
			hrHandler.CreatePayroll,
			middleware.AuditMiddleware(auditSvc),
		)
		hr.GET("/employee/payroll/history",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT), string(dto.READ_ONLY)),
			hrHandler.GetPayrollHistory,
		)
		hr.PUT("/employee/payroll",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT)),
			hrHandler.UpdatePayrollHistory,
			middleware.AuditMiddleware(auditSvc),
		)
		hr.DELETE("/employee/payroll/:id",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT)),
			hrHandler.DeletePayrollHistory,
			middleware.AuditMiddleware(auditSvc),
		)
		hr.GET("/employee/birthday",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.HR_HEAD), string(dto.HR_ASSISTANT), string(dto.READ_ONLY)),
			hrHandler.GetBirthdays,
		)
	}
}
