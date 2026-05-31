package middleware

import (
	"bytes"
	"io"
	"rims-backend/internal/helper/logger"
	"strings"

	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

// CustomResponseWriter to capture response data
type CustomResponseWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

// Write method override to capture response body
func (w *CustomResponseWriter) Write(b []byte) (int, error) {
	w.body.Write(b)                  // Write response to buffer
	return w.ResponseWriter.Write(b) // Write response to original writer
}

// LoggerMiddleware logs request and response data in structured JSON format
func LoggerMiddleware(excludedPaths []string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		// Start timer
		start := time.Now()
		// Normalize URL path to exclude query parameters for comparison
		normalizedPath := ctx.Request.URL.Path

		// Skip logging for excluded paths
		for _, path := range excludedPaths {
			if strings.Contains(normalizedPath, path) {
				ctx.Next() // Proceed without logging
				return
			}
		}

		// Generate or retrieve trace ID
		traceID := ctx.GetHeader("X-Trace-ID")
		if traceID == "" {
			traceID = uuid.New().String()
		}
		ctx.Set("xTraceID", traceID)
		ctx.Writer.Header().Set("X-Trace-ID", traceID)
		ctx.Set("remoteIP", ctx.RemoteIP())

		// Log request data
		requestBody, _ := io.ReadAll(ctx.Request.Body)
		ctx.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))

		logger.Info(ctx, "Request",
			zap.String("log_phase", "request"),
			zap.String("method", ctx.Request.Method), // TODO log phase
			zap.String("endpoint", ctx.Request.URL.Path),
			zap.ByteString("body", requestBody), // TODO body
		)

		// Capture response
		writer := &CustomResponseWriter{ResponseWriter: ctx.Writer, body: bytes.NewBufferString("")}
		ctx.Writer = writer

		// Process request
		ctx.Next()

		duration := time.Since(start)
		logger.Info(ctx, "Response",
			zap.String("log_phase", "response"),
			zap.String("endpoint", ctx.Request.URL.Path),
			zap.Int("status_code", ctx.Writer.Status()),
			zap.Duration("duration", duration),
			zap.ByteString("body", writer.body.Bytes()),
		)
	}
}
