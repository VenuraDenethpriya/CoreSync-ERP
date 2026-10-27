package finance

import (
	"CoreSync-backend/internal/service/domain"
	"CoreSync-backend/internal/storage/repository"
	"context"

	"gorm.io/gorm"
)

type Service interface {
	CreatePurchaseOrder(ctx context.Context, purchaseOrder *domain.Finance) (*domain.Finance, error)
	GetPurchaseOrders(ctx context.Context, query string, limit int, offset int) ([]*domain.Finance, int, error)
	GetPurchaseOrderByID(ctx context.Context, purchaseOrder *domain.Finance) (*domain.Finance, error)
	DeletePurchaseOrder(ctx context.Context, purchaseOrder *domain.Finance, actingClerkID string) (*domain.Finance, string, error)
	UpdatePurchaseOrder(ctx context.Context, purchaseOrder *domain.Finance, actingClerkID string) (*domain.Finance, string, error)
	GetPurchaseItems(ctx context.Context, query string, limit int, offset int) ([]*domain.Finance, int, error)
}
type service struct {
	db          *gorm.DB
	financeRepo repository.FinanceRepository
	userRepo    repository.UserRepository
}

func NewService(
	db *gorm.DB,
	financeRepo repository.FinanceRepository,
	userRepo repository.UserRepository) Service {
	return &service{
		db:          db,
		financeRepo: financeRepo,
		userRepo:    userRepo,
	}
}
