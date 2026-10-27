package product

import (
	"CoreSync-backend/internal/service/domain"
	"context"

	"github.com/google/uuid"

	"CoreSync-backend/internal/storage/repository"
)

// Service defines the interface for product-related business logic
type Service interface {
	CreateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error)
	UpdateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error)
	DeleteProduct(ctx context.Context, product *domain.Product, actingClerkID string) (*domain.Product, string, error)
	GetProductByID(ctx context.Context, product *domain.Product) (*domain.Product, error)
	GetProducts(ctx context.Context, query string, limit int, offset int) ([]*domain.Product, int, error)
	GetOrderProductByID(ctx context.Context, id uuid.UUID) (*domain.Product, error)
	GetBasicProductInfo(ctx context.Context) ([]*domain.Product, error)
	CreateProductBom(ctx context.Context, boms []*domain.Bom) ([]*domain.Bom, error)
	GetProductBomByID(ctx context.Context, product *domain.Product) ([]*domain.Bom, error)
	DeleteProductBom(ctx context.Context, bom *domain.Bom, actingClerkID string) (*domain.Bom, string, error)
	UpdateProductBom(ctx context.Context, bom *domain.Bom, actingClerkID string) (*domain.Bom, string, error)
}

// service implements Service
type service struct {
	repo     repository.ProductRepository
	userRepo repository.UserRepository
}

// NewService creates a new product service
func NewService(productRepo repository.ProductRepository, userRepo repository.UserRepository) Service {
	return &service{repo: productRepo,
		userRepo: userRepo,
	}
}
