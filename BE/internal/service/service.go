package service

import (
	"CoreSync-backend/internal/email"
	"CoreSync-backend/internal/events"
	auditlogs "CoreSync-backend/internal/service/audit_logs"
	"CoreSync-backend/internal/service/customer"
	"CoreSync-backend/internal/service/dashboard"
	"CoreSync-backend/internal/service/finance"
	"CoreSync-backend/internal/service/hr"
	"CoreSync-backend/internal/service/inventory"
	"CoreSync-backend/internal/service/order"
	"CoreSync-backend/internal/service/product"
	"CoreSync-backend/internal/service/production"
	"CoreSync-backend/internal/service/repair"
	"CoreSync-backend/internal/service/report"
	"CoreSync-backend/internal/service/sale"
	"CoreSync-backend/internal/service/site"
	"CoreSync-backend/internal/service/stockcontrol" // [ADDED 2026-10-13]
	"CoreSync-backend/internal/service/task"
	"CoreSync-backend/internal/service/user"
	pg "CoreSync-backend/internal/storage"
	"CoreSync-backend/pkg/sms"
	"fmt"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"gorm.io/gorm"
)

type Config struct {
	Repositories *pg.Repository
	DB           *gorm.DB
}

type Services struct {
	resendClient      *email.ResendClient
	sheetsClient      *email.GoogleSheetsClient
	CustomerService   customer.Service
	OrderService      order.Service
	ProductService    product.Service
	InventoryService  inventory.Service
	UserService       user.Service
	DashboardService  dashboard.Service
	AuditlogsService  auditlogs.Service
	TaskService       task.Service
	SaleService       sale.Service
	RepairService     repair.Service
	ReportService     report.Service
	SiteService       site.Service
	FinanceService    finance.Service
	HrService         hr.Service
	ProductionService production.Service
	StockControl      *stockcontrol.Service // [ADDED 2026-10-13]
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
	smsSender, err := sms.NewDialogSmsSender()
	if err != nil {
		panic(fmt.Errorf("failed to initialize SMS client: %w", err))
	}

	bus := events.NewEventBus()

	// [MOVED 2026-10-13] unchanged; created before the order service because stock control needs it
	inventoryService := inventory.NewService(
		cfg.DB,
		*cfg.Repositories.InventoryRepository,
		*cfg.Repositories.InventoryOrderRepository,
		*cfg.Repositories.InventoryItemRepository,
		*cfg.Repositories.InventoryItemUsageRepository,
		*cfg.Repositories.InventoryItemRestockRepository,
		*cfg.Repositories.InventoryItemAllocationRepository,
		*cfg.Repositories.UserRepository,
	)

	// [ADDED 2026-10-13] inventory controls (uses the existing receiving logic inside its transactions)
	stockControl := stockcontrol.NewService(cfg.DB, inventoryService.ReceiveInTx)
	// approval emails to Eranja (STOCK_APPROVER_EMAIL) through the existing Resend client
	if to := stockcontrol.ApproverEmails(); len(to) > 0 {
		stockControl.SetMailer(func(subject, html string) error {
			return emailSender.SendOrderConfirmation(email.EmailMessage{
				From: "CoreSync CoreSync <" + os.Getenv("FROM_EMAIL") + ">", To: to, Subject: subject, Html: html,
			})
		})
	}

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
		stockControl, // [ADDED 2026-10-13]
	)

	productService := product.NewService(*cfg.Repositories.ProductRepository, *cfg.Repositories.UserRepository)

	userService := user.NewService(*cfg.Repositories.UserRepository)
	dashboardService := dashboard.NewService(*cfg.Repositories.DashboardRepository)
	auditlogs := auditlogs.NewService(*cfg.Repositories.AuditLogsRepository)
	taskService := task.NewService(*cfg.Repositories.TaskRepository, *cfg.Repositories.UserRepository)
	saleService := sale.NewService(*cfg.Repositories.SalesRepository, *cfg.Repositories.SalespersonRepository, *cfg.Repositories.CallRepository, *cfg.Repositories.UserRepository, cld)
	repairService := repair.NewService(cfg.DB, *cfg.Repositories.RepairRepository, *cfg.Repositories.UserRepository)
	reportService := report.NewService(cfg.DB, *cfg.Repositories.ReportRepository)
	siteService := site.NewService(cfg.DB, *cfg.Repositories.SiteRepository, *cfg.Repositories.UserRepository)
	financeService := finance.NewService(cfg.DB, *cfg.Repositories.FinanceRepository, *cfg.Repositories.UserRepository)
	hrService := hr.NewService(cfg.DB, *cfg.Repositories.HrRepository, *cfg.Repositories.UserRepository, emailSender, smsSender)
	productionService := production.NewService(*cfg.Repositories.ProductionRepository, *cfg.Repositories.UserRepository)
	return &Services{
		resendClient:      resendClient,
		sheetsClient:      sheetClient,
		CustomerService:   customerService,
		OrderService:      orderService,
		ProductService:    productService,
		InventoryService:  inventoryService,
		UserService:       userService,
		DashboardService:  dashboardService,
		AuditlogsService:  auditlogs,
		TaskService:       taskService,
		SaleService:       saleService,
		RepairService:     repairService,
		ReportService:     reportService,
		SiteService:       siteService,
		FinanceService:    financeService,
		HrService:         hrService,
		ProductionService: productionService,
		StockControl:      stockControl, // [ADDED 2026-10-13]
	}
}
