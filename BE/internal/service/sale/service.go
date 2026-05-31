package sale

import (
	"context"
	"rims-backend/internal/service/domain"
	"rims-backend/internal/storage/repository"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/google/uuid"
)

type Service interface {
	// Sale Services
	CreateSale(ctx context.Context, sale *domain.Sale, actingClerkID string) (*domain.Sale, string, error)
	GetSales(ctx context.Context, query string, status string, limit int, offset int) ([]*domain.Sale, int64, error)
	GetSalesList(ctx context.Context, query string, limit int, offset int) ([]*domain.Sale, error)
	UpdateSale(ctx context.Context, sale *domain.Sale, actingClerkID string) (*domain.Sale, string, error)
	DeleteSale(ctx context.Context, sale *domain.Sale, actingClerkID string) (*domain.Sale, string, error)
	GetSaleByID(ctx context.Context, sale *domain.Sale) (*domain.Sale, error)

	// Salesperson Services
	CreateSalesperson(ctx context.Context, salesperson *domain.Salesperson, actingClerkID string) (*domain.Salesperson, string, error)
	GetSalespersons(ctx context.Context, query string, limit int, offset int) ([]*domain.Salesperson, []int, []float64, int64, error)
	UpdateSalesperson(ctx context.Context, salesperson *domain.Salesperson, actingClerkID string) (*domain.Salesperson, string, error)
	DeleteSalesperson(ctx context.Context, salesperson *domain.Salesperson, actingClerkID string) (*domain.Salesperson, string, error)
	GetSalespersonByID(ctx context.Context, salesperson *domain.Salesperson) (*domain.Salesperson, int, float64, int, float64, error)
	GetSalespersonsList(ctx context.Context) ([]*domain.Salesperson, error)
	GetSalesAndCommissionByDateRange(ctx context.Context, SalespersonID uuid.UUID, StartDate time.Time, EndDate time.Time) (int, float64, error)

	// Call Services
	CreateCall(ctx context.Context, call *domain.Call) (*domain.Call, error)
	GetCalls(ctx context.Context, query string, limit int, offset int) ([]*domain.Call, int, error)
}

type service struct {
	repo            repository.SaleRepository
	salespersonRepo repository.SalespersonRepository
	callRepo        repository.CallRepository
	cld             *cloudinary.Cloudinary
	userRepo        repository.UserRepository
}

func NewService(saleRepo repository.SaleRepository,
	salespersonRepo repository.SalespersonRepository,
	callRepo repository.CallRepository,
	userRepo repository.UserRepository,
	cld *cloudinary.Cloudinary,
) Service {
	return &service{
		repo:            saleRepo,
		salespersonRepo: salespersonRepo,
		callRepo:        callRepo,
		userRepo:        userRepo,
		cld:             cld,
	}
}
