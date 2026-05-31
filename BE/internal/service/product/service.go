package product

import (
	"context"
	"rims-backend/internal/service/domain"
	"rims-backend/internal/storage/repository"
)

// Service defines the interface for product-related business logic
type Service interface {
	CreateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error)
	UpdateProduct(ctx context.Context, product *domain.Product) (*domain.Product, error)
	DeleteProduct(ctx context.Context, product *domain.Product) (*domain.Product, error)
	GetProductByID(ctx context.Context, product *domain.Product) (*domain.Product, error)
	GetProducts(ctx context.Context, query string, limit int, offset int) ([]*domain.Product, int, error)
	GetBasicProductInfo(ctx context.Context) ([]*domain.Product, error)
}

// service implements Service
type service struct {
	repo repository.ProductRepository
}

// NewService creates a new product service
func NewService(productRepo repository.ProductRepository) Service {
	return &service{repo: productRepo}
}
