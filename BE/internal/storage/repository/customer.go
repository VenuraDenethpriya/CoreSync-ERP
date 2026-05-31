package repository

import (
	"context"
	"errors"
	"fmt"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"
	"rims-backend/pkg/uuid"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

// CustomerRepository implements port.CustomerRepository interface
type CustomerRepository struct {
	db *gorm.DB
}

// NewCustomerRepository creates a new customer repository instance
func NewCustomerRepository(db *gorm.DB) *CustomerRepository {
	return &CustomerRepository{
		db,
	}
}

func (ur *CustomerRepository) GetCustomerByPhoneNo(ctx context.Context, phoneNo string) (*domain.Customer, error) {
	var customerModel models.CustomerModel
	if err := ur.db.Where("phone_no1 = ?", phoneNo).First(&customerModel).Error; err != nil {
		// If not found, return nil with no error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return customerModel.CustomerModelToDomain(), nil
}

// CreateCustomer creates a new customer in the database
func (ur *CustomerRepository) CreateCustomer(ctx context.Context, customer *domain.Customer) (*domain.Customer, error) {
	customerModel := models.CustomerModelFromDomain(customer)
	if err := ur.db.Create(customerModel).Error; err != nil {
		logger.Error(ctx, "Error creating customer", zap.String("method", "POST"), zap.String("path", "/customers"), zap.Any("customer", customer), zap.Error(err))
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", customerModel.CreatedBy).Error; err == nil {
		customerModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", customerModel.CreatedBy), zap.Error(err))
	}
	logger.Info(ctx, "Customer created", zap.String("method", "POST"), zap.String("path", "/customers"), zap.Any("customer", customer))
	return customerModel.CustomerModelToDomain(), nil
}

// GetCustomerByID gets a customer by ID
func (ur *CustomerRepository) GetCustomerByID(ctx context.Context, customer *domain.Customer) (*domain.Customer, error) {
	var customerModel models.CustomerModel
	err := ur.db.WithContext(ctx).
		// Preload("Orders").
		Preload("Orders.OrderPayments").
		Preload("Quotes").
		First(&customerModel, "customer_id = ?", customer.CustomerID).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("customer with ID %s not found", customer.CustomerID)
		}
		return nil, err
	}
	return customerModel.CustomerModelToDomain(), nil
}

// GetCustomers returns a slice of customers
func (ur *CustomerRepository) GetCustomers(ctx context.Context) ([]*domain.Customer, error) {
	var customers []*models.CustomerModel
	err := ur.db.Find(&customers).Error
	if err != nil {
		return nil, err
	}
	var domainCustomers []*domain.Customer
	for _, c := range customers {
		domainCustomers = append(domainCustomers, c.CustomerModelToDomain())
	}
	return domainCustomers, nil
}

func (ur *CustomerRepository) UpdateCustomer(ctx context.Context, customer *domain.Customer) (*domain.Customer, error) {
	var customerModel models.CustomerModel

	err := ur.db.Where("customer_id = ?", customer.CustomerID).First(&customerModel).Error
	if err != nil {
		return nil, err
	}

	customerModel.Title = customer.Title
	customerModel.FirstName = customer.FirstName
	customerModel.LastName = customer.LastName
	customerModel.Address = customer.Address
	customerModel.PhoneNo1 = customer.PhoneNo1
	customerModel.PhoneNo2 = customer.PhoneNo2
	customerModel.Email = customer.Email
	customerModel.VatNo = customer.VatNo
	err = ur.db.Updates(&customerModel).Error
	if err != nil {
		logger.Error(ctx, "Error updating customer", zap.String("method", "PUT"), zap.String("path", "/customers/:customer-id"), zap.Any("customer", customer), zap.Error(err))
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", customerModel.CreatedBy).Error; err == nil {
		customerModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", customerModel.CreatedBy), zap.Error(err))
	}
	logger.Info(ctx, "Customer updated", zap.String("method", "PUT"), zap.String("path", "/customers/:customer-id"), zap.Any("customer", customer))
	return customerModel.CustomerModelToDomain(), nil
}

func (ur *CustomerRepository) DeleteCustomer(ctx context.Context, customer *domain.Customer) (*domain.Customer, error) {
	var customerModel models.CustomerModel
	err := ur.db.First(&customerModel, customer.CustomerID).Error
	if err != nil {
		return nil, err
	}
	err = ur.db.Delete(&customerModel).Error
	if err != nil {
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := ur.db.First(&userModel, "clerk_id = ?", customerModel.CreatedBy).Error; err == nil {
		customerModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", customerModel.CreatedBy), zap.Error(err))
	}
	return customerModel.CustomerModelToDomain(), nil
}

// SearchCustomers searches for customers based on a search query and returns paginated results
func (ur *CustomerRepository) SearchCustomers(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Customer, int, error) {
	var results []struct {
		models.CustomerModel
		LastOrderType string    `gorm:"column:last_order_type"`
		LastOrderNo   string    `gorm:"column:last_order_no"`
		LastOrderDate time.Time `gorm:"column:last_order_date"`
	}

	var whereClause string
	var args []interface{}

	parsedUUID, err := uuid.Parse(searchQuery)
	if err == nil {
		whereClause = " WHERE c.customer_id = ?"
		args = append(args, parsedUUID)
	} else {
		searchPattern := "%" + searchQuery + "%"
		whereClause = ` WHERE c.first_name ILIKE ? OR c.last_name ILIKE ? OR c.address ILIKE ? OR c.phone_no1 ILIKE ? OR c.email ILIKE ? OR c.title ILIKE ?`
		args = append(args, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)
	}

	// Count total customers matching the filter
	var total int64
	countQuery := "SELECT COUNT(*) FROM customers c" + whereClause
	if err := ur.db.Raw(countQuery, args...).Scan(&total).Error; err != nil {
		return nil, 0, err
	}

	// Paginated query with latest order join
	baseQuery := `
		SELECT
			c.*,
			o.type AS last_order_type,
			o.order_no AS last_order_no,
			o.created_at AS last_order_date
		FROM
			customers c
		LEFT JOIN LATERAL (
			SELECT type, order_no, created_at
			FROM orders
			WHERE customer_id = c.customer_id
			ORDER BY created_at DESC
			LIMIT 1
		) o ON TRUE
	`
	paginationClause := " ORDER BY c.created_at DESC LIMIT ? OFFSET ?"
	argsWithPagination := append(args, limit, offset)

	finalQuery := baseQuery + whereClause + paginationClause
	if err := ur.db.Raw(finalQuery, argsWithPagination...).Scan(&results).Error; err != nil {
		return nil, 0, err
	}

	var domainCustomers []*domain.Customer
	for _, res := range results {
		domainCustomer := models.CustomerModelToDomain(&res.CustomerModel)
		domainCustomer.LastOrder = domain.LastOrderInfo{
			Type: res.LastOrderType,
			No:   res.LastOrderNo,
			Date: res.LastOrderDate,
		}
		domainCustomers = append(domainCustomers, domainCustomer)
	}

	return domainCustomers, int(total), nil
}

func (ur *CustomerRepository) GetCustomersTableData(ctx context.Context) ([]*domain.Customer, error) {
	var results []struct {
		models.CustomerModel
		LastOrderType string
		LastOrderNo   string
		LastOrderDate time.Time
	}

	query := `
		SELECT
			c.*,
			o.type AS last_order_type,
			o.order_no AS last_order_no,
			o.created_at AS last_order_date
		FROM
			customers c
		LEFT JOIN LATERAL (
			SELECT type, order_no, created_at
			FROM orders
			WHERE customer_id = c.customer_id
			ORDER BY created_at DESC
			LIMIT 1
		) o ON TRUE;
	`
	if err := ur.db.Raw(query).Scan(&results).Error; err != nil {
		return nil, err
	}

	var domainCustomers []*domain.Customer
	for _, res := range results {
		domainCustomer := models.CustomerModelToDomain(&res.CustomerModel)
		domainCustomer.LastOrder = domain.LastOrderInfo{
			Type: res.LastOrderType,
			No:   res.LastOrderNo,
			Date: res.LastOrderDate,
		}
		domainCustomers = append(domainCustomers, domainCustomer)
	}

	return domainCustomers, nil
}
