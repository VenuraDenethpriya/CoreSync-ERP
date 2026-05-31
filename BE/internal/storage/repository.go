package storage

import (
	repository "rims-backend/internal/storage/repository"
)

// Repository storage of all repositories.
type Repository struct {
	CustomerRepository                *repository.CustomerRepository
	OrderRepository                   *repository.OrderRepository
	OrderItemRepository               *repository.OrderItemRepository
	QuoteRepository                   *repository.QuoteRepository
	QuoteItemRepository               *repository.QuoteItemRepository
	ProductRepository                 *repository.ProductRepository
	UserRepository                    *repository.UserRepository
	InventoryRepository               *repository.InventoryRepository
	DashboardRepository               *repository.DashboardRepository
	InventoryItemUsageRepository      *repository.InventoryItemUsageRepository
	InventoryItemRestockRepository    *repository.InventoryItemRestockRepository
	InventoryItemAllocationRepository *repository.InventoryItemAllocationRepository
	InventoryItemRepository           *repository.InventoryItemRepository
	PaymentRepository                 *repository.PaymentRepository
	TaskRepository                    *repository.TaskRepository
	AuditLogsRepository               *repository.AuditLogsRepository
	SalesRepository                   *repository.SaleRepository
	SalespersonRepository             *repository.SalespersonRepository
	CallRepository                    *repository.CallRepository
	RepairRepository                  *repository.RepairRepository
	ReportRepository                  *repository.ReportRepository
}

// NewRepository postgres implementation for storage of all repositories.
func NewRepository(db *DB) *Repository {
	userRepo := repository.NewUserRepository(db.DB)
	return &Repository{
		QuoteRepository:                   repository.NewQuoteRepository(db.DB),
		QuoteItemRepository:               repository.NewQuoteItemRepository(db.DB),
		CustomerRepository:                repository.NewCustomerRepository(db.DB),
		OrderRepository:                   repository.NewOrderRepository(db.DB),
		OrderItemRepository:               repository.NewOrderItemRepository(db.DB),
		ProductRepository:                 repository.NewProductRepository(db.DB),
		UserRepository:                    userRepo,
		InventoryRepository:               repository.NewInventoryRepository(db.DB),
		DashboardRepository:               repository.NewDashboardRepository(db.DB),
		InventoryItemUsageRepository:      repository.NewInventoryItemUsageRepository(db.DB),
		InventoryItemRestockRepository:    repository.NewInventoryItemRestockRepository(db.DB),
		InventoryItemAllocationRepository: repository.NewInventoryItemAllocationRepostitory(db.DB),
		InventoryItemRepository:           repository.NewInventoryItemRepository(db.DB),
		PaymentRepository:                 repository.NewPaymentRespository(db.DB),
		TaskRepository:                    repository.NewTaskRepository(db.DB, userRepo),
		AuditLogsRepository:               repository.NewAuditLogsRepository(db.DB),
		SalesRepository:                   repository.NewSaleRepository(db.DB),
		SalespersonRepository:             repository.NewSalespersonRepository(db.DB),
		CallRepository:                    repository.NewCallRepository(db.DB),
		RepairRepository:                  repository.NewRepairRepository(db.DB),
		ReportRepository:                  repository.NewReportRepository(db.DB),
	}
}
