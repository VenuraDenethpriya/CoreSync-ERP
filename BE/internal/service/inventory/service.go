package inventory

import (
	"context"
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"rims-backend/internal/storage/repository"
)

type Service interface {
	CreateInventory(ctx context.Context, inventory *domain.Inventory) (*domain.Inventory, error)
	GetInventory(ctx context.Context, query string, limit int, offset int) ([]*domain.Inventory, int, error)
	UpdateInventory(ctx context.Context, inventory *domain.Inventory, actingClerkID string) (*domain.Inventory, string, error)
	GetInventoryById(ctx context.Context, inventory *domain.Inventory) (*domain.Inventory, error)
	DeleteInventory(ctx context.Context, inventory *domain.Inventory, actingClerkID string) (*domain.Inventory, string, error)
	// GetInventoryItemUsages(ctx context.Context, orderID uuid.UUID, itemID uuid.UUID, limit int, offset int) ([]*domain.InventoryItemUsage, int, error)
	GetInventoryItemUsages(ctx context.Context, orderID uuid.UUID, itemID uuid.UUID, limit int, offset int) ([]*domain.InventoryItemUsage, int, string, error)
	// CreateInventoryItemUsage(ctx context.Context, inventoryItemUsage *domain.InventoryItemUsage) (*domain.InventoryItemUsage, error)
	CreateInventoryItemUsage(ctx context.Context, usageReq domain.InventoryItemUsage) (*domain.InventoryItemUsage, error)
	CreateInventoryItemAllocation(ctx context.Context, inventoryItemAllocation *domain.InventoryItemAllocate) (*domain.InventoryItemAllocate, error)
	// CreateInventoryItemsBatch(tx *gorm.DB, items []models.InventoryItemModel) error
	DeleteInventoryItemUsage(ctx context.Context, inventoryItemUsage *domain.InventoryItemUsage, actingClerkID string) (*domain.InventoryItemUsage, string, error)
	DeleteInventoryItemAllocation(ctx context.Context, allocation *domain.InventoryItemAllocate, actingClerkID string) (*domain.InventoryItemAllocate, string, error)
	UpdateInventoryItemUsage(ctx context.Context, inventoryItemUsage *domain.InventoryItemUsage, actingClerkID string) (*domain.InventoryItemUsage, string, error)
	UpdateInventoryItemAllocation(ctx context.Context, inventoryItemAllocate *domain.InventoryItemAllocate, actingClerkID string) (*domain.InventoryItemAllocate, string, error)
	UpdateInventoryItemRestockPrintStatus(ctx context.Context, inventoryItemRestock *domain.InventoryItemRestock, actingClerkID string) (*domain.InventoryItemRestock, string, error)
	GetNonResellableInventory(ctx context.Context, query string, limit int) ([]*domain.Inventory, error)
	CreateInventoryItemRestock(ctx context.Context, inventoryItemRestock *domain.InventoryItemRestock) (*domain.InventoryItemRestock, error)
	GetInventoryItemRestock(ctx context.Context, itemID uuid.UUID, limit int, offset int) ([]*domain.InventoryItemRestock, int, error)
	GetInventoryItemAllocation(ctx context.Context, orderID uuid.UUID, itemID uuid.UUID, limit int, offset int) ([]*domain.InventoryItemAllocate, int, error)
	GetInventoryItemByCode(ctx context.Context, inventoryItem *domain.InventoryItem) (*domain.InventoryItem, error)
}
type service struct {
	db           *gorm.DB
	repo         repository.InventoryRepository
	itemRepo     repository.InventoryItemRepository
	usageRepo    repository.InventoryItemUsageRepository
	restockRepo  repository.InventoryItemRestockRepository
	allocateRepo repository.InventoryItemAllocationRepository
	userRepo     repository.UserRepository
}

func NewService(
	db *gorm.DB,
	inventoryRepo repository.InventoryRepository,
	inventoryItemRepo repository.InventoryItemRepository,
	inventoryItemUsageRepo repository.InventoryItemUsageRepository,
	inventoryItemRestockRepo repository.InventoryItemRestockRepository,
	inventoryItemAllocationRepo repository.InventoryItemAllocationRepository,
	userRepo repository.UserRepository,
) Service {
	return &service{
		db:           db,
		repo:         inventoryRepo,
		itemRepo:     inventoryItemRepo,
		usageRepo:    inventoryItemUsageRepo,
		restockRepo:  inventoryItemRestockRepo,
		allocateRepo: inventoryItemAllocationRepo,
		userRepo:     userRepo,
	}
}
