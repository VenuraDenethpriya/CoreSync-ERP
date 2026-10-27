package call

import (
	dto "CoreSync-backend/internal/controller/http/dto/const"
	"CoreSync-backend/internal/controller/http/middleware"
	"CoreSync-backend/internal/service/sale"

	"github.com/gin-gonic/gin"
)

type CallHandler struct {
	saleService sale.Service
}

func NewCallHandler(svc sale.Service) *CallHandler {
	return &CallHandler{
		saleService: svc,
	}
}
func SetupCallRoutes(
	router *gin.RouterGroup,
	callHandler *CallHandler,
) {
	call := router.Group("/calls")
	{
		call.POST("",
			callHandler.CreateCall,
		)
		call.GET("",
			middleware.ClerkAuthMiddleware(),
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF), string(dto.SALES_TEAM), string(dto.FINANCE_HEAD), string(dto.READ_ONLY)),
			callHandler.GetCalls,
		)
	}
}
