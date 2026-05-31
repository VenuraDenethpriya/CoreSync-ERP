package call

import (
	dto "rims-backend/internal/controller/http/dto/const"
	"rims-backend/internal/controller/http/middleware"
	"rims-backend/internal/service/sale"

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
			middleware.RoleAuthMiddleware(string(dto.SUPER_ADMIN), string(dto.HEAD), string(dto.OFFICE_STAFF)),
			callHandler.GetCalls,
		)
	}
}
