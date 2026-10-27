package middleware

import (
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/domain"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func AuditMiddleware(auditSvc auditlogs.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("user_id")
		c.Next()

		desc, _ := c.Get("audit_desc")
		if rb := c.GetString(ContextKeyRequestedBy); rb != "" {
			desc = fmt.Sprintf("%v (via Claude, requested by %s)", desc, rb)
		}

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
