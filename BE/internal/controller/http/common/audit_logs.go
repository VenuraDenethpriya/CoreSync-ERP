package common

import (
	"github.com/gin-gonic/gin"
)

type AuditLogDetails struct {
	Headers     map[string]string
	Description string
}

func SetAuditInfo(ctx *gin.Context, details AuditLogDetails) {
	for key, value := range details.Headers {
		ctx.Header(key, value)
	}
	ctx.Set("audit_desc", details.Description)
}
