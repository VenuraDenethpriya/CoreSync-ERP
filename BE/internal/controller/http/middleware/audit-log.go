package middleware

import (
	"fmt"
	auditlogs "rims-backend/internal/service/audit_logs"
	"rims-backend/internal/service/domain"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func AuditMiddleware(auditSvc auditlogs.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		c.Next()

		desc, _ := c.Get("audit_desc")

		logEntry := domain.AuditLog{
			ID:          uuid.New(),
			StatusCode:  c.Writer.Status(),
			Action:      c.Writer.Header().Get("X-Response-Message"),
			UserID:      userID,
			Description: fmt.Sprintf("%v", desc),
			CreatedAt:   time.Now().UTC(),
		}
		go auditSvc.Save(logEntry)
	}
}
