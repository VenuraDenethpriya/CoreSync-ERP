package dto

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
)

// CreateCustomerRequest represents the request body for creating a new customer
type CreateCustomerRequest struct {
	Title     string `json:"Title" binding:"required"`
	FirstName string `json:"FirstName" binding:"required"`
	LastName  string `json:"LastName"`
	Address   string `json:"Address"`
	PhoneNo1  string `json:"PhoneNo1" binding:"required"`
	PhoneNo2  string `json:"PhoneNo2"`
	Email     string `json:"Email"`
	VatNo     string `json:"VatNo"`
	CreatedBy string `json:"CreatedBy"`
}

// CreateCustomerResponse represents the response body for creating a new customer
type CreateCustomerResponse struct {
	CustomerID uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	Title      string    `gorm:"type:varchar(20);" json:"title"`
	FirstName  string    `gorm:"type:varchar(255);" json:"first_name"`
	LastName   string    `gorm:"type:varchar(255);" json:"last_name"`
	Address    string    `gorm:"type:varchar(255);" json:"address"`
	PhoneNo1   string    `gorm:"type:varchar(20):not null" json:"phone_no1"`
	PhoneNo2   string    `gorm:"type:varchar(20);" json:"phone_no2"`
	Email      string    `gorm:"type:varchar(255);" json:"email"`
	VatNo      string    `gorm:"type:varchar(255);" json:"VatNo"`
	CreatedBy  string    `gorm:"type:varchar(255);not null" json:"created_by"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// NewCreateCustomerResponse creates a new CreateCustomerResponse instance from a domain.Customer
func NewCreateCustomerResponse(customer *domain.Customer) *CreateCustomerResponse {
	return &CreateCustomerResponse{
		CustomerID: customer.CustomerID,
		Title:      customer.Title,
		FirstName:  customer.FirstName,
		LastName:   customer.LastName,
		Address:    customer.Address,
		PhoneNo1:   customer.PhoneNo1,
		PhoneNo2:   customer.PhoneNo2,
		Email:      customer.Email,
		VatNo:      customer.VatNo,
		CreatedBy:  customer.CreatedBy,
		CreatedAt:  customer.CreatedAt,
		UpdatedAt:  customer.UpdatedAt,
	}
}

// GetCustomerByIDRequest represents the request uri for getting a customer by ID
type GetCustomerIdRequest struct {
	CustomerID string `uri:"customerId" json:"customerId"`
}

// GetCustomerByIdResponse represents the response body for getting a customer by ID
type GetCustomerByIdResponse struct {
	CustomerID uuid.UUID          `gorm:"type:uuid;primary_key" json:"customerId"`
	Title      string             `gorm:"type:varchar(20);" json:"title"`
	FirstName  string             `gorm:"type:varchar(255) not null" json:"first_name"`
	LastName   string             `gorm:"type:varchar(255) not null" json:"last_name"`
	Address    string             `gorm:"type:varchar(255);" json:"address"`
	PhoneNo1   string             `gorm:"type:varchar(20):not null" json:"phone_no1"`
	PhoneNo2   string             `gorm:"type:varchar(20);" json:"phone_no2"`
	Email      string             `gorm:"type:varchar(255);" json:"email"`
	VatNo      string             `gorm:"type:varchar(255);" json:"vat_no"`
	CreatedAt  time.Time          `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time          `gorm:"autoUpdateTime" json:"updated_at"`
	Orders     []domain.OrderInfo `json:"orders"`
	Quotes     []domain.QuoteInfo `json:"quotes"`
}

// NewGetCustomerByIdResponse creates a new GetCustomerByIdResponse instance from a domain.Customer
func NewGetCustomerByIdResponse(customer *domain.Customer) *GetCustomerByIdResponse {
	return &GetCustomerByIdResponse{
		CustomerID: customer.CustomerID,
		Title:      customer.Title,
		FirstName:  customer.FirstName,
		LastName:   customer.LastName,
		Address:    customer.Address,
		PhoneNo1:   customer.PhoneNo1,
		PhoneNo2:   customer.PhoneNo2,
		Email:      customer.Email,
		VatNo:      customer.VatNo,
		CreatedAt:  customer.CreatedAt,
		UpdatedAt:  customer.UpdatedAt,
		Orders:     customer.Orders,
		Quotes:     customer.Quotes,
	}
}

// GetCustomerResponse represents the response body for getting a customer
type GetCustomerResponse struct {
	CustomerID uuid.UUID `gorm:"type:uuid;primary_key" json:"customerId"`
	Title      string    `gorm:"type:varchar(20);" json:"title"`
	FirstName  string    `gorm:"type:varchar(255) not null" json:"first_name"`
	LastName   string    `gorm:"type:varchar(255) not null" json:"last_name"`
	Address    string    `gorm:"type:varchar(255);" json:"address"`
	PhoneNo    string    `gorm:"type:varchar(20):not null" json:"phone_no"`
	Email      string    `gorm:"type:varchar(255);" json:"email"`
	VatNo      string    `gorm:"type:varchar(255);" json:"vat_no"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// GetCustomersResponse represents the response body for getting customers
type GetCustomersResponse struct {
	Customers []*GetCustomerResponse `json:"customers"`
}

// NewGetCustomerResponse creates a new GetCustomerResponse instance from a domain.Customer
func NewGetCustomerResponse(customer *domain.Customer) *GetCustomerResponse {
	return &GetCustomerResponse{
		CustomerID: customer.CustomerID,
		Title:      customer.Title,
		FirstName:  customer.FirstName,
		LastName:   customer.LastName,
		Address:    customer.Address,
		PhoneNo:    customer.PhoneNo1,
		Email:      customer.Email,
		VatNo:      customer.VatNo,
		CreatedAt:  customer.CreatedAt,
		UpdatedAt:  customer.UpdatedAt,
	}
}

// NewGetCustomersResponse creates a new GetCustomersResponse instance from a slice of domain.Customer
func NewGetCustomersResponse(customers []*domain.Customer) *GetCustomersResponse {
	var getCustomersResponse []*GetCustomerResponse // Change to a slice of pointers
	for _, customer := range customers {
		getCustomersResponse = append(getCustomersResponse, NewGetCustomerResponse(customer)) // Append the pointer
	}
	return &GetCustomersResponse{
		Customers: getCustomersResponse,
	}
}

type UpdateCustomerRequest struct {
	CustomerID string `uri:"customer-id" binding:"required" json:"customer_id"`
	Title      string `json:"Title,omitempty"`
	FirstName  string `json:"FirstName,omitempty"`
	LastName   string `json:"LastName,omitempty"`
	Address    string `json:"Address,omitempty"`
	PhoneNo1   string `json:"PhoneNo1,omitempty"`
	PhoneNo2   string `json:"PhoneNo2,omitempty"`
	Email      string `json:"Email,omitempty"`
	VatNo      string `json:"VatNo,omitempty"`
}
type UpdateCustomerResponse struct {
	CustomerID uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	Title      string    `gorm:"type:varchar(20);" json:"title"`
	FirstName  string    `gorm:"type:varchar(255);" json:"first_name"`
	LastName   string    `gorm:"type:varchar(255);" json:"last_name"`
	Address    string    `gorm:"type:varchar(255);" json:"address"`
	PhoneNo1   string    `gorm:"type:varchar(20):not null" json:"phone_no1"`
	PhoneNo2   string    `gorm:"type:varchar(20):not null" json:"phone_no2"`
	Email      string    `gorm:"type:varchar(255);" json:"email"`
	VatNo      string    `gorm:"type:varchar(255);" json:"vat_no"`
	CreatedBy  string    `gorm:"type:varchar(255);not null" json:"created_by"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func NewUpdateCustomerResponse(customer *domain.Customer) *UpdateCustomerResponse {
	return &UpdateCustomerResponse{
		CustomerID: customer.CustomerID,
		Title:      customer.Title,
		FirstName:  customer.FirstName,
		LastName:   customer.LastName,
		Address:    customer.Address,
		PhoneNo1:   customer.PhoneNo1,
		PhoneNo2:   customer.PhoneNo2,
		Email:      customer.Email,
		VatNo:      customer.VatNo,
		CreatedAt:  customer.CreatedAt,
		UpdatedAt:  customer.UpdatedAt,
	}
}

type DeleteCustomerRequest struct {
	CustomerID string `uri:"customer-id" binding:"required" json:"customer-id"`
}
type DeleteCustomerResponse struct {
	CustomerID uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
}

func NewDeleteCustomerResponse(customer *domain.Customer) *DeleteCustomerResponse {
	return &DeleteCustomerResponse{
		CustomerID: customer.CustomerID,
	}
}

type SearchCustomersURI struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}
type SearchCustomersResponse struct {
	Customers      CustomerTableData `json:"customers"`
	Total          int               `json:"total"`
	TotalCustomers int               `json:"total_customers"`
}

func NewSearchCustomersResponse(customers []*domain.Customer, totalCustomers int) *CustomersTableDataResponse {
	var response []CustomerTableData
	for _, c := range customers {
		response = append(response, CustomerTableData{
			CustomerID:    c.CustomerID,
			Title:         c.Title,
			FirstName:     c.FirstName,
			LastName:      c.LastName,
			PhoneNo:       c.PhoneNo1,
			LastOrderType: c.LastOrder.Type,
			LastOrderNo:   c.LastOrder.No,
			LastOrderDate: c.LastOrder.Date,
			CreatedAt:     c.CreatedAt,
			UpdatedAt:     c.UpdatedAt,
		})
	}

	return &CustomersTableDataResponse{
		Customers:      response,
		TotalCustomers: totalCustomers,
		Total:          len(customers),
	}
}

type CustomerTableData struct {
	CustomerID    uuid.UUID `json:"customer_id"`
	Title         string    `json:"title"`
	FirstName     string    `json:"first_name"`
	LastName      string    `json:"last_name"`
	PhoneNo       string    `json:"phone_no"`
	LastOrderType string    `json:"last_order_type"`
	LastOrderNo   string    `json:"last_order_no"`
	LastOrderDate time.Time `json:"last_order_date"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
type CustomersTableDataResponse struct {
	Customers      []CustomerTableData `json:"customers"`
	TotalCustomers int                 `json:"totalCustomers"`
	Total          int                 `json:"total"`
}

func NewCustomersTableDataResponse(customers []*domain.Customer) *CustomersTableDataResponse {
	var response []CustomerTableData
	for _, c := range customers {
		response = append(response, CustomerTableData{
			CustomerID:    c.CustomerID,
			Title:         c.Title,
			FirstName:     c.FirstName,
			LastName:      c.LastName,
			PhoneNo:       c.PhoneNo1,
			LastOrderType: c.LastOrder.Type,
			LastOrderNo:   c.LastOrder.No,
			LastOrderDate: c.LastOrder.Date,
			CreatedAt:     c.CreatedAt,
			UpdatedAt:     c.UpdatedAt,
		})
	}
	return &CustomersTableDataResponse{
		Customers: response,
	}
}

type GetCustomerByPhoneNoRequest struct {
	PhoneNo1 string `uri:"phoneNo" json:"phoneNo1"`
}

type GetCustomerByPhoneNoResponse struct {
	CustomerID uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	Title      string    `gorm:"type:varchar(20);" json:"title"`
	FirstName  string    `gorm:"type:varchar(255) not null" json:"first_name"`
	LastName   string    `gorm:"type:varchar(255) not null" json:"last_name"`
	Address    string    `gorm:"type:varchar(255);" json:"address"`
	PhoneNo1   string    `gorm:"type:varchar(20):not null" json:"phone_no1"`
	PhoneNo2   string    `gorm:"type:varchar(20):not null" json:"phone_no2"`
	Email      string    `gorm:"type:varchar(255);" json:"email"`
	VatNo      string    `gorm:"type:varchar(255);" json:"vat_no"`
}

func NewGetCustomerByPhoneNoResponse(customer *domain.Customer) *GetCustomerByPhoneNoResponse {
	return &GetCustomerByPhoneNoResponse{
		CustomerID: customer.CustomerID,
		Title:      customer.Title,
		FirstName:  customer.FirstName,
		LastName:   customer.LastName,
		Address:    customer.Address,
		PhoneNo1:   customer.PhoneNo1,
		PhoneNo2:   customer.PhoneNo2,
		Email:      customer.Email,
		VatNo:      customer.VatNo,
	}
}
