# Build stage
FROM golang:1.24.2-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Tidy up the modules
RUN go mod tidy

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Production stage
FROM alpine:latest

# Install ca-certificates and wget for health checks
RUN apk --no-cache add ca-certificates tzdata wget

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/main .

# Copy environment file
COPY .env .

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Set default HTTP_PORT if not provided
ENV HTTP_PORT=${HTTP_PORT:-8080}
ENV POSTGRES_PORT=${POSTGRES_PORT:-5432}

# Expose the port dynamically based on HTTP_PORT
EXPOSE ${HTTP_PORT}
EXPOSE ${POSTGRES_PORT}

# Health check using the actual health endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${HTTP_PORT}/api/v1/healthcheck || exit 1

# Command to run the application
CMD ["./main"]
