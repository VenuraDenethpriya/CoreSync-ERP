package api

import (
	"log"
	"net/http"
	"os"
	"rims-backend/docs"
	"rims-backend/internal/config"
	"rims-backend/internal/controller/http/api/customer"
	"rims-backend/internal/controller/http/api/dashboard"
	"rims-backend/internal/controller/http/api/inventory"
	"rims-backend/internal/controller/http/api/order"
	"rims-backend/internal/controller/http/api/order/quote"
	"rims-backend/internal/controller/http/api/product"
	"rims-backend/internal/controller/http/api/repair"
	"rims-backend/internal/controller/http/api/report"
	"rims-backend/internal/controller/http/api/sale"
	"rims-backend/internal/controller/http/api/sale/call"
	"rims-backend/internal/controller/http/api/sale/salesperson"
	"rims-backend/internal/controller/http/api/setting"
	"rims-backend/internal/controller/http/api/task"
	"rims-backend/internal/controller/http/api/user"
	"rims-backend/internal/controller/http/api/ws"
	"rims-backend/internal/controller/http/middleware"
	"rims-backend/internal/events"
	"rims-backend/internal/service"
	"rims-backend/pkg/sms"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// Router is a wrapper for HTTP router
type Router struct {
	*gin.Engine
}

// NewRouter creates a new HTTP router
func NewRouter(config *config.HTTP, services *service.Services, bus *events.EventBus, smsService sms.Sender) (*Router, error) {
	// Disable debug mode in production
	if config.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Initialize Clerk Client
	clerkSecretKey := os.Getenv("CLERK_SECRET_KEY")
	if clerkSecretKey == "" {
		log.Fatal("CLERK_SECRET_KEY environment variable not set. Please provide it for Clerk authentication.")
	}

	clerkAPIKey := os.Getenv("CLERK_API_KEY")
	if clerkAPIKey == "" {
		log.Fatal("CLERK_API_KEY environment variable not set. Please provide it for fetching Clerk user details.")
	}
	// Set the global ClerkAPIKey in middleware package
	middleware.ClerkAPIKey = clerkAPIKey

	clerkAPIURL := os.Getenv("CLERK_API_URL")
	if clerkAPIURL == "" {
		clerkAPIURL = "https://positive-gannet-7.clerk.accounts.dev"
		log.Printf("CLERK_API_URL environment variable not set, defaulting to %s", clerkAPIURL)
	}

	middleware.ClerkAPIBaseURL = clerkAPIURL

	router.Use(
		middleware.LoggerMiddleware([]string{"/v1/docs"}),
		gin.Recovery(),
		cors.New(getCORSConfig(config.AllowedOrigins)),
	)

	// Conditionally apply Clerk authentication middleware based on env var
	// enableAuth := os.Getenv("ENABLE_AUTH")
	// if strings.ToLower(enableAuth) == "true" {
	// 	router.Use(middleware.ClerkAuthMiddleware())
	// 	log.Println("Authentication middleware ENABLED")
	// } else {
	// 	log.Println("Authentication middleware DISABLED (for development/testing)")
	// }

	orderHandler,
		quoteHandler,
		customerHandler,
		productHandler,
		inventoryHandler,
		userHandler,
		dashboardHandler,
		settingHandler,
		taskHandler,
		wsHandler,
		saleHandler,
		salespersonHandler,
		callHandler,
		repairHandler,
		reportHandler := SetupHandlers(services, bus, smsService)

	docs.SwaggerInfo.BasePath = "/api/v1"
	v1 := router.Group("/api/v1")

	// Global OPTIONS handler to ensure proper CORS handling
	router.OPTIONS("/*path", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	// Swagger and health check routes (typically public)
	v1.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, func(cfg *ginSwagger.Config) {
		cfg.PersistAuthorization = true
	}))
	v1.GET("/healthcheck", healthCheck)

	// Swagger UI root path (also typically public)
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	auditSvc := services.AuditlogsService

	// Register API routes
	order.SetupOrderRoutes(v1, orderHandler, quoteHandler, auditSvc)
	customer.SetupCustomerRoutes(v1, customerHandler, auditSvc)
	product.SetupProductRoutes(v1, productHandler, auditSvc)
	user.SetupUserRoutes(v1, userHandler, auditSvc)
	inventory.SetupInventoryRoutes(v1, inventoryHandler, auditSvc)
	dashboard.SetupDashboardRoutes(v1, dashboardHandler)
	setting.SetupSettingRoutes(v1, settingHandler)
	task.SetupTaskRoutes(v1, taskHandler, auditSvc)
	ws.SetupWsRoutes(v1, wsHandler)
	sale.SetupSaleRoutes(v1, saleHandler, salespersonHandler, callHandler, auditSvc)
	repair.SetupRepairRoutes(v1, repairHandler, auditSvc)
	report.SetupReportRoutes(v1, reportHandler, auditSvc)
	return &Router{
		router,
	}, nil
}

// healthCheck handles a basic health check endpoint
func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "healthy"})
}

// getCORSConfig returns the CORS configuration based on allowed origins
//
//	func getCORSConfig(allowedOrigins string) cors.Config {
//		corsConfig := cors.DefaultConfig()
//		corsConfig.AllowOrigins = strings.Split(allowedOrigins, ",")
//		corsConfig.AllowHeaders = []string{"Origin", "Authorization", "Content-Type", "Accept", "X-Requested-With"}
//		corsConfig.AllowCredentials = true
//		return corsConfig
//	}
func getCORSConfig(allowedOrigins string) cors.Config {
	corsConfig := cors.DefaultConfig()
	// Split the origins from .env
	corsConfig.AllowOrigins = strings.Split(allowedOrigins, ",")

	// Explicitly allow the Authorization header for Clerk tokens
	corsConfig.AllowHeaders = []string{
		"Origin",
		"Authorization",
		"Content-Type",
		"Accept",
		"X-Requested-With",
	}

	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	corsConfig.AllowCredentials = true
	return corsConfig
}

// Serve starts the HTTP server
func (r *Router) Serve(listenAddr string) error {
	return r.Run(listenAddr)
}

// SetupHandlers initializes all HTTP handlers
func SetupHandlers(
	services *service.Services,
	bus *events.EventBus,
	smsService sms.Sender,
) (*order.OrderHandler,
	*quote.QuoteHandler,
	*customer.CustomerHandler,
	*product.ProductHandler,
	*inventory.InventoryHandler,
	*user.UserHandler,
	*dashboard.DashboardHandler,
	*setting.SettingHandler,
	*task.TaskHandler,
	*ws.WebSocketHandler,
	*sale.SaleHandler,
	*salesperson.SalepersonHandler,
	*call.CallHandler,
	*repair.RepairHandler,
	*report.ReportHandler) {
	orderHandler := order.NewOrderHandler(services.OrderService, services.CustomerService, bus, smsService)
	quoteHandler := quote.NewQuoteHandler(services.OrderService, services.CustomerService)
	customerHandler := customer.NewCustomerHandler(services.CustomerService)
	productHandler := product.NewProductHandler(services.ProductService)
	inventoryHandler := inventory.NewInventoryHandler(services.InventoryService)
	userHandler := user.NewUserHandler(services.UserService)
	dashboardHandler := dashboard.NewDashboardHandler(services.DashboardService)
	settingHandler := setting.NewSettingHandler(services.AuditlogsService)
	taskHandler := task.NewTaskHandler(services.TaskService, bus)
	wsHandler := ws.NewWebSocketHandler(bus)
	saleHandler := sale.NewSaleHandler(services.SaleService)
	salespersonHandler := salesperson.NewSalepersonHandler(services.SaleService)
	callHandler := call.NewCallHandler(services.SaleService)
	repairHandler := repair.NewRepairHandler(services.RepairService)
	reportHandler := report.NewReportHandler(services.ReportService)
	return orderHandler,
		quoteHandler,
		customerHandler,
		productHandler,
		inventoryHandler,
		userHandler,
		dashboardHandler,
		settingHandler,
		taskHandler,
		wsHandler,
		saleHandler,
		salespersonHandler,
		callHandler,
		repairHandler,
		reportHandler
}
