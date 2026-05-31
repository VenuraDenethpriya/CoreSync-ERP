package customer

import (
	"context"
	"rims-backend/internal/service/domain"
	"rims-backend/internal/storage/repository"
)

// Service defines the interface for customer-related business logic
type Service interface {
	GetCustomerByPhoneNo(ctx context.Context, phoneNo string) (*domain.Customer, error)
	CreateCustomer(ctx context.Context, customer *domain.Customer) (*domain.Customer, error)
	GetCustomerByID(ctx context.Context, customer *domain.Customer) (*domain.Customer, error)
	GetCustomers(ctx context.Context) ([]*domain.Customer, error)
	DeleteCustomer(ctx context.Context, customer *domain.Customer, actingClerkID string) (*domain.Customer, string, error)
	SearchCustomers(ctx context.Context, query string, limit int, offset int) ([]*domain.Customer, int, error)
	GetCustomersTableData(ctx context.Context) ([]*domain.Customer, error)
	UpdateCustomer(ctx context.Context, customer *domain.Customer, actingClerkID string) (*domain.Customer, string, error)
}

// service implements Service
type service struct {
	repo     repository.CustomerRepository
	userRepo repository.UserRepository
}

// NewService creates a new customer service
func NewService(customerRepo repository.CustomerRepository, userRepo repository.UserRepository) Service {
	return &service{
		repo:     customerRepo,
		userRepo: userRepo,
	}
}
