package service

import (
	"fmt"
	"os"
	"rims-backend/internal/email"
	"rims-backend/internal/events"
	auditlogs "rims-backend/internal/service/audit_logs"
	"rims-backend/internal/service/customer"
	"rims-backend/internal/service/dashboard"
	"rims-backend/internal/service/inventory"
	"rims-backend/internal/service/order"
	"rims-backend/internal/service/product"
	"rims-backend/internal/service/repair"
	"rims-backend/internal/service/report"
	"rims-backend/internal/service/sale"
	"rims-backend/internal/service/task"
	"rims-backend/internal/service/user"
	pg "rims-backend/internal/storage"

	"github.com/cloudinary/cloudinary-go/v2"
	"gorm.io/gorm"
)

type Config struct {
	Repositories *pg.Repository
	DB           *gorm.DB
}

type Services struct {
	resendClient     *email.ResendClient
	sheetsClient     *email.GoogleSheetsClient
	CustomerService  customer.Service
	OrderService     order.Service
	ProductService   product.Service
	InventoryService inventory.Service
	UserService      user.Service
	DashboardService dashboard.Service
	AuditlogsService auditlogs.Service
	TaskService      task.Service
	SaleService      sale.Service
	RepairService    repair.Service
	ReportService    report.Service
}

func SetupServices(cfg Config) *Services {
	if cfg.DB == nil {
		panic("SetupServices: cfg.DB cannot be nil. Please pass the GORM DB connection in main.go")
	}

	resendClient := email.NewResendClient()

	credsPath := os.Getenv("GOOGLE_CREDENTIALS_PATH")
	sheetID := os.Getenv("GOOGLE_SHEET_ID")

	if credsPath == "" || sheetID == "" {
		panic("Google Sheets credentials path or spreadsheet ID not set in environment variables")
	}
	sheetClient, err := email.NewGoogleSheetsClient(credsPath, sheetID)
	if err != nil {
		panic(fmt.Errorf("failed to initialize Google Sheets client: %w", err))
	}

	cldName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	cldKey := os.Getenv("CLOUDINARY_API_KEY")
	cldSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cldName == "" || cldKey == "" || cldSecret == "" {
		panic("Cloudinary credentials (CLOUD_NAME, API_KEY, API_SECRET) not set")
	}

	cld, err := cloudinary.NewFromParams(cldName, cldKey, cldSecret)
	if err != nil {
		panic(fmt.Errorf("failed to initialize Cloudinary client: %w", err))
	}

	customerService := customer.NewService(
		*cfg.Repositories.CustomerRepository,
		*cfg.Repositories.UserRepository,
	)
	emailSender := email.NewResendClient()
	bus := events.NewEventBus()

	orderService := order.NewService(
		*cfg.Repositories.OrderRepository,
		*cfg.Repositories.QuoteRepository,
		*cfg.Repositories.QuoteItemRepository,
		*cfg.Repositories.OrderItemRepository,
		*cfg.Repositories.CustomerRepository,
		*cfg.Repositories.PaymentRepository,
		*cfg.Repositories.UserRepository,
		emailSender,
		sheetClient,
		bus,
	)

	productService := product.NewService(*cfg.Repositories.ProductRepository)

	inventoryService := inventory.NewService(
		cfg.DB,
		*cfg.Repositories.InventoryRepository,
		*cfg.Repositories.InventoryItemRepository,
		*cfg.Repositories.InventoryItemUsageRepository,
		*cfg.Repositories.InventoryItemRestockRepository,
		*cfg.Repositories.InventoryItemAllocationRepository,
		*cfg.Repositories.UserRepository,
	)
	userService := user.NewService(*cfg.Repositories.UserRepository)
	dashboardService := dashboard.NewService(*cfg.Repositories.DashboardRepository)
	auditlogs := auditlogs.NewService(*cfg.Repositories.AuditLogsRepository)
	taskService := task.NewService(*cfg.Repositories.TaskRepository, *cfg.Repositories.UserRepository)
	saleService := sale.NewService(*cfg.Repositories.SalesRepository, *cfg.Repositories.SalespersonRepository, *cfg.Repositories.CallRepository, *cfg.Repositories.UserRepository, cld)
	repairService := repair.NewService(cfg.DB, *cfg.Repositories.RepairRepository, *cfg.Repositories.UserRepository)
	reportService := report.NewService(cfg.DB, *cfg.Repositories.ReportRepository)
	return &Services{
		resendClient:     resendClient,
		sheetsClient:     sheetClient,
		CustomerService:  customerService,
		OrderService:     orderService,
		ProductService:   productService,
		InventoryService: inventoryService,
		UserService:      userService,
		DashboardService: dashboardService,
		AuditlogsService: auditlogs,
		TaskService:      taskService,
		SaleService:      saleService,
		RepairService:    repairService,
		ReportService:    reportService,
	}
}
