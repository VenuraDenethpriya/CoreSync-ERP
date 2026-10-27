package dto

import (
	"CoreSync-backend/internal/service/domain"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// CreateNewQuote
// CreateQuoteRequst represents the request body for creating a new quote
type AdditionalChargeForQuote struct {
	Type  string  `json:"type"`
	Value float64 `json:"value"`
}

type CreateQuoteRequest struct {
	Type              string                     `json:"Type" validate:"required"`
	QuoteNo           string                     `json:"QuoteNo" validate:"required"`
	SubTotal          float64                    `json:"SubTotal" validate:"required"`
	AdditionalCharges []AdditionalChargeForQuote `json:"additional_charges,omitempty"`
	Discount          float64                    `json:"Discount,omitempty"`
	Total             float64                    `json:"Total" validate:"required"`
	Vat               bool                       `json:"Vat" validate:"required"`
	IsCatalog         bool                       `json:"IsCatalog" validate:"required"`
	PoNo              string                     `json:"PoNo,omitempty"`
	SalesID           string                     `json:"SalesID,omitempty"`
	CreatedBy         string                     `json:"CreatedBy" validate:"required"`
}

// CreateQuoteResponce represents the response body for creating a new quote
type CreateQuoteResponse struct {
	QuoteID    uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	CustomerID uuid.UUID `gorm:"type:uuid;primary_key" json:"customer_id"`
	// CreatedBy  uuid.UUID `gorm:"type:uuid;primary_key" json:"created_by"`
	Type              string                     `json:"type"`
	QuoteNo           string                     `json:"quote_no"`
	SubTotal          float64                    `json:"subtotal"`
	AdditionalCharges []AdditionalChargeForQuote `json:"additional_charges"`
	Discount          float64                    `json:"discount,omitempty"`
	Total             float64                    `json:"total"`
	Status            string                     `json:"status"`
	IsCatalog         bool                       `json:"IsCatalog" validate:"required"`
	Vat               bool                       `json:"Vat" validate:"required"`
	PoNo              string                     `json:"PoNo"`
	SalesID           uuid.UUID                  `json:"SalesID"`
	CreatedBy         string                     `json:"created_by"`
	CreatedAt         time.Time                  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time                  `gorm:"autoUpdateTime" json:"updated_at"`
}

func convertAdditionalChargesForQuoteFromDomain(domainCharges []domain.AdditionalChargeForQuote) []AdditionalChargeForQuote {
	var charges []AdditionalChargeForQuote
	for _, c := range domainCharges {
		charges = append(charges, AdditionalChargeForQuote{
			Type:  c.Type,
			Value: c.Value,
		})
	}
	return charges
}

// NewQuoteResponse creates a new QuoteResponse instance from a domain.Quote
func NewQuoteResponse(quote *domain.Quote) *CreateQuoteResponse {
	return &CreateQuoteResponse{
		QuoteID:           quote.QuoteID,
		CustomerID:        quote.CustomerID,
		CreatedBy:         quote.CreatedBy,
		Type:              quote.Type,
		QuoteNo:           quote.QuoteNo,
		SubTotal:          quote.SubTotal,
		AdditionalCharges: convertAdditionalChargesForQuoteFromDomain(quote.AdditionalCharges),
		Discount:          quote.Discount,
		Total:             quote.Total,
		Vat:               quote.Vat,
		IsCatalog:         quote.IsCatalog,
		Status:            quote.Status,
		PoNo:              quote.PoNo,
		SalesID:           quote.SalesID,
		CreatedAt:         quote.CreatedAt,
		UpdatedAt:         quote.UpdatedAt,
	}
}

// CreateQuoteItemRequest represents the request body for creating a new quote item
type CreateQuoteItemRequest struct {
	Items []struct {
		ProductID uuid.UUID `json:"product_id" validate:"required"`
		Quantity  int       `json:"quantity,omitempty" validate:"required"`
		UnitPrice float64   `json:"unit_price,omitempty"`
		SubTotal  float64   `json:"subtotal"`
		Note      string    `json:"note,omitempty"`
	} `json:"items" validate:"required,dive"`
}

// CreateQuoteItemResponse represents the response body for creating a new quote item
type CreateQuoteItemResponse struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	QuoteNo   uuid.UUID `gorm:"type:uuid;primary_key" json:"QuoteNo"`
	ProductID uuid.UUID `gorm:"type:uuid;primary_key" json:"product_id"`
	Quantity  int       `json:"Quantity,omitempty"`
	UnitPrice float64   `json:"unit_price,omitempty"`
	SubTotal  float64   `json:"SubTotal"`
	Note      string    `json:"Note,omitempty"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// NewQuoteItemResponse creates a new QuoteItemResponse instance from a domain.QuoteItem
func NewQuoteItemResponse(quoteItem *domain.QuoteItem) *CreateQuoteItemResponse {
	return &CreateQuoteItemResponse{
		ID:        quoteItem.ID,
		QuoteNo:   quoteItem.QuoteNo,
		ProductID: quoteItem.ProductID,
		Quantity:  quoteItem.Quantity,
		UnitPrice: quoteItem.UnitPrice,
		SubTotal:  quoteItem.SubTotal,
		Note:      quoteItem.Note,
		CreatedAt: quoteItem.CreatedAt,
	}
}

// CreateFullQuoteRequest represents the request body for creating a new quote with customer and items
type CreateFullQuoteRequest struct {
	Customer CreateCustomerRequest  `json:"customer" validate:"required"`
	Quote    CreateQuoteRequest     `json:"quote" validate:"required"`
	Items    CreateQuoteItemRequest `json:"quote_items" validate:"required"`
}

// CreateFullQuoteResponse represents the response body for creating a new quote with customer and items
type CreateFullQuoteResponse struct {
	QuoteID           uuid.UUID                 `gorm:"type:uuid;primary_key" json:"id"`
	SalesID           uuid.UUID                 `gorm:"type:uuid;primary_key" json:"SalesID"`
	CustomerID        uuid.UUID                 `gorm:"type:uuid;primary_key" json:"customer_id"`
	FirstName         string                    `json:"first_name"`
	LastName          string                    `json:"last_name"`
	Address           string                    `json:"address"`
	PhoneNo1          string                    `json:"phone_no1"`
	PhoneNo2          string                    `json:"phone_no2"`
	Email             string                    `json:"email"`
	CreatedBy         string                    `json:"created_by"`
	Type              string                    `json:"type"`
	QuoteNo           string                    `json:"quote_no"`
	SubTotal          float64                   `json:"subtotal"`
	AdditionalCharges json.RawMessage           `json:"additional_charges"`
	Discount          float64                   `json:"discount,omitempty"`
	Total             float64                   `json:"total"`
	Vat               bool                      `json:"vat"`
	IsCatalog         bool                      `json:"is_catalog"`
	Status            string                    `json:"status"`
	Items             []CreateQuoteItemResponse `json:"items"`
	PoNo              string                    `json:"PoNo"`
	CreatedAt         time.Time                 `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time                 `gorm:"autoUpdateTime" json:"updated_at"`
}

type GetQuotesRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

// GetQuotesResponse represents the response body for retrieving a list of quotes
type QuoteResponse struct {
	ID        uuid.UUID `json:"id"`
	Type      string    `json:"type"`
	QuoteN0   string    `json:"quote_no"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Total     float64   `json:"total_price"`
	Vat       bool      `json:"vat"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
type GetQuotesResponse struct {
	Quotes      []QuoteResponse `json:"quotes"`
	Total       int             `json:"total"`
	TotalQuotes int             `json:"total_quotes"`
}

// NewGetQuotesResponse creates a new GetQuotesResponse instance from a slice of domain.Quote
func NewGetQuotesResponse(quotes []*domain.Quote, totalQuotes int) *GetQuotesResponse {
	var response []QuoteResponse
	for _, q := range quotes {
		response = append(response, QuoteResponse{
			ID:        q.QuoteID,
			Type:      q.Type,
			QuoteN0:   q.QuoteNo,
			FirstName: q.Customer.FirstName,
			LastName:  q.Customer.LastName,
			Total:     q.Total,
			Vat:       q.Vat,
			Status:    q.Status,
			CreatedAt: q.CreatedAt,
			UpdatedAt: q.UpdatedAt,
		})
	}

	return &GetQuotesResponse{
		Quotes:      response,
		Total:       len(quotes),
		TotalQuotes: totalQuotes,
	}
}

// UpdateQuoteStatusRequest represents the request body for updating a quote status
type UpdateQuoteStatusRequest struct {
	QuoteID string `json:"quote_id" binding:"required" validate:"required"`
	Status  string `json:"status" binding:"required" validate:"required"`
}

// UpdateQuoteStatusResponse represents the response body for updating a quote status
type UpdateQuoteStatusResponse struct {
	QuoteID uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
}

// NewUpdateQuoteStatusResponse creates a new UpdateQuoteStatusResponse instance from a domain.Quote
func NewUpdateQuoteStatusResponse(quote *domain.Quote) *UpdateQuoteStatusResponse {
	return &UpdateQuoteStatusResponse{
		QuoteID: quote.QuoteID,
	}
}

// GetQuoteIdRequest represents the request uri for getting a quote by ID
type GetQuoteIdRequest struct {
	QuoteID string `uri:"quote-id" binding:"required" json:"quote-id"`
}

// QuoteItemResponse represents the response body for getting a quote item
type QuoteItemResponse struct {
	ID          uuid.UUID `json:"id"`
	QuoteNo     uuid.UUID `gorm:"foreignKey:QuoteNo" json:"quote_no"`
	ProductID   uuid.UUID `gorm:"foreignKey:ProductID" json:"product_id"`
	ProductName string    `json:"product_name"`
	Quantity    int       `json:"quantity"`
	UnitPrice   float64   `json:"unit_price"`
	SubTotal    float64   `json:"subtotal"`
	Note        string    `json:"note"`
	CreatedAt   time.Time `json:"created_at"`
}

// NewGetQuoteByIdResponse creates a new GetQuoteByIdResponse instance from a domain.Quote
type GetQuoteByIdResponse struct {
	QuoteID           uuid.UUID                  `gorm:"type:uuid;primary_key" json:"id"`
	CustomerID        uuid.UUID                  `gorm:"type:uuid;primary_key" json:"customer_id"`
	Title             string                     `json:"title"`
	FirstName         string                     `json:"first_name"`
	LastName          string                     `json:"last_name"`
	Address           string                     `json:"address"`
	PhoneNo1          string                     `json:"phone_no1"`
	PhoneNo2          string                     `json:"phone_no2"`
	Email             string                     `json:"email"`
	VatNo             string                     `json:"vat_no"`
	TinNo             string                     `json:"tin_no"`
	CreatedBy         string                     `json:"created_by"`
	Type              string                     `json:"type"`
	QuoteNo           string                     `json:"quote_no"`
	SubTotal          float64                    `json:"subtotal"`
	AdditionalCharges []AdditionalChargeForQuote `json:"additional_charges"`
	Discount          float64                    `json:"discount,omitempty"`
	Total             float64                    `json:"total"`
	Vat               bool                       `json:"vat"`
	IsCatalog         bool                       `json:"is_catalog"`
	Status            string                     `json:"status"`
	Items             []QuoteItemResponse        `json:"items"`
	PoNo              string                     `json:"PoNo"`
	SalesID           uuid.UUID                  `json:"sales_id"`
	SalesNo           string                     `json:"sales_no"`
	Salesperson       string                     `json:"salesperson"`
	SalespersonPhone  string                     `json:"salesperson_phone"`
	SaleType          string                     `json:"sales_type"`
	Commission        float64                    `json:"commission"`
	Date              time.Time                  `json:"date"`
	Description       string                     `json:"description"`
	RecordingURL      string                     `json:"recording_url"`
	CreatedAt         time.Time                  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time                  `gorm:"autoUpdateTime" json:"updated_at"`
}

// NewGetQuoteByIdResponse creates a new GetQuoteByIdResponse instance from a domain.Quote
func NewGetQuoteByIdResponse(quote *domain.Quote) *GetQuoteByIdResponse {
	var items []QuoteItemResponse
	for _, item := range quote.QuoteItems {
		items = append(items, QuoteItemResponse{
			ID:          item.ID,
			QuoteNo:     item.QuoteNo,
			ProductID:   item.ProductID,
			ProductName: item.ProductName.Name,
			Quantity:    item.Quantity,
			UnitPrice:   item.UnitPrice,
			SubTotal:    item.SubTotal,
			Note:        item.Note,
			CreatedAt:   item.CreatedAt,
		})
	}
	var salesID uuid.UUID
	salesNo, saleType, salesperson, salespersonPhone, description, recordingURL := "", "", "", "", "", ""
	var commission float64
	var saleDate time.Time

	if quote.Sale != nil {
		salesID = quote.Sale.SalesID
		salesNo = quote.Sale.SalesNo
		saleType = quote.Sale.SalesType
		if quote.Sale != nil && quote.Sale.Commission != nil {
			commission = *quote.Sale.Commission
		}
		saleDate = quote.Sale.Date
		description = quote.Sale.Description
		recordingURL = quote.Sale.RecordingURL
		if quote.Sale.SalespersonData != nil {
			salesperson = quote.Sale.SalespersonData.FirstName + " " + quote.Sale.SalespersonData.LastName
			salespersonPhone = quote.Sale.SalespersonData.PhoneNo
		}
	}

	title, firstName, lastName, address, phoneNo1, phoneNo2, email, VatNo, TinNo := "", "", "", "", "", "", "", "", ""
	if quote.Customer != nil {
		title = quote.Customer.Title
		firstName = quote.Customer.FirstName
		lastName = quote.Customer.LastName
		address = quote.Customer.Address
		phoneNo1 = quote.Customer.PhoneNo1
		phoneNo2 = quote.Customer.PhoneNo2
		email = quote.Customer.Email
		VatNo = quote.Customer.VatNo
		TinNo = quote.Customer.TinNo
	}

	return &GetQuoteByIdResponse{
		QuoteID:           quote.QuoteID,
		CustomerID:        quote.CustomerID,
		Title:             title,
		FirstName:         firstName,
		LastName:          lastName,
		Address:           address,
		PhoneNo1:          phoneNo1,
		PhoneNo2:          phoneNo2,
		Email:             email,
		VatNo:             VatNo,
		TinNo:             TinNo,
		CreatedBy:         quote.CreatedBy,
		Type:              quote.Type,
		QuoteNo:           quote.QuoteNo,
		SubTotal:          quote.SubTotal,
		AdditionalCharges: convertAdditionalChargesForQuoteFromDomain(quote.AdditionalCharges),
		Discount:          quote.Discount,
		Total:             quote.Total,
		Vat:               quote.Vat,
		IsCatalog:         quote.IsCatalog,
		Status:            quote.Status,
		Items:             items,
		PoNo:              quote.PoNo,
		SalesID:           salesID,
		SalesNo:           salesNo,
		SaleType:          saleType,
		Salesperson:       salesperson,
		SalespersonPhone:  salespersonPhone,
		Commission:        commission,
		Date:              saleDate,
		Description:       description,
		RecordingURL:      recordingURL,
		CreatedAt:         quote.CreatedAt,
		UpdatedAt:         quote.UpdatedAt,
	}
}

// GetLastQuoteNoResponse represents the response body for getting the last quote number
type GetLastQuoteNoResponse struct {
	QuoteNo string `json:"quote_no"`
}

// NewGetLastQuoteNoResponse creates a new GetLastQuoteNoResponse instance from a string
func NewGetLastQuoteNoResponse(quoteNo string) *GetLastQuoteNoResponse {
	return &GetLastQuoteNoResponse{
		QuoteNo: quoteNo,
	}
}

// UpdateQuoteIdRequest represents the request uri for updating a quote
type UpdateQuoteIdRequest struct {
	QuoteID string `uri:"quote-id" json:"quote-id"`
}

// UpdateQuoteRequest represents the request body for updating a quote
type UpdateQuoteRequest struct {
	QuoteNo           string                     `json:"QuoteNo" validate:"required"`
	SubTotal          float64                    `json:"SubTotal" validate:"required"`
	Discount          float64                    `json:"Discount,omitempty"`
	AdditionalCharges []AdditionalChargeForQuote `json:"additional_charges,omitempty"`
	Total             float64                    `json:"Total" validate:"required"`
	Vat               bool                       `json:"Vat" validate:"required"`
	IsCatalog         bool                       `json:"IsCatalog" validate:"required"`
	PoNo              string                     `json:"PoNo"`
	SalesID           uuid.UUID                  `json:"SalesID,omitempty"`
	Status            string                     `json:"Status" validate:"required"`
}

// UpdateQuoteResponse represents the response body for updating a quote
type UpdateQuoteResponse struct {
	QuoteID           uuid.UUID                  `gorm:"type:uuid;primary_key" json:"id"`
	CustomerID        uuid.UUID                  `gorm:"type:uuid;primary_key" json:"customer_id"`
	CreatedBy         string                     `json:"created_by"`
	QuoteNo           string                     `json:"quote_no"`
	SubTotal          float64                    `json:"subtotal"`
	Discount          float64                    `json:"discount,omitempty"`
	AdditionalCharges []AdditionalChargeForQuote `json:"additional_charges,omitempty"`
	Total             float64                    `json:"total"`
	Vat               bool                       `json:"vat"`
	IsCatalog         bool                       `json:"is_catalog"`
	Status            string                     `json:"status"`
	PoNo              string                     `json:"PoNo"`
	SalesID           uuid.UUID                  `json:"SalesID,omitempty"`
	CreatedAt         time.Time                  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time                  `gorm:"autoUpdateTime" json:"updated_at"`
}

// NewUpdateQuoteResponse creates a new UpdateQuoteResponse instance from a domain.Quote
func NewUpdateQuoteResponse(quote *domain.Quote) *UpdateQuoteResponse {
	return &UpdateQuoteResponse{
		QuoteID:           quote.QuoteID,
		CustomerID:        quote.CustomerID,
		CreatedBy:         quote.CreatedBy,
		QuoteNo:           quote.QuoteNo,
		SubTotal:          quote.SubTotal,
		Discount:          quote.Discount,
		AdditionalCharges: convertAdditionalChargesForQuoteFromDomain(quote.AdditionalCharges),
		Total:             quote.Total,
		Vat:               quote.Vat,
		IsCatalog:         quote.IsCatalog,
		Status:            quote.Status,
		PoNo:              quote.PoNo,
		CreatedAt:         quote.CreatedAt,
		UpdatedAt:         quote.UpdatedAt,
	}
}

// UpdateQuoteitemIdRequest represents the request body for updating a quote item
type UpdateQuoteitemIdRequest struct {
	Items []struct {
		ID        *uuid.UUID `json:"id,omitempty"`
		ProductID uuid.UUID  `json:"product_id" validate:"required"`
		Quantity  int        `json:"quantity" validate:"required"`
		UnitPrice float64    `json:"unit_price,omitempty"`
		SubTotal  float64    `json:"subtotal"`
		Note      string     `json:"note,omitempty"`
	} `json:"items" validate:"required,dive"`
}

type UpdateQuoteItemResponse struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	QuoteNo   uuid.UUID `gorm:"type:uuid;primary_key" json:"QuoteNo"`
	ProductID uuid.UUID `gorm:"type:uuid;primary_key" json:"product_id"`
	Quantity  int       `json:"Quantity,omitempty"`
	UnitPrice float64   `json:"unit_price,omitempty"`
	SubTotal  float64   `json:"SubTotal"`
	Note      string    `json:"Note,omitempty"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func NewUpdateQuoteItemResponse(quoteItem *domain.QuoteItem) *UpdateQuoteItemResponse {
	return &UpdateQuoteItemResponse{
		ID:        quoteItem.ID,
		QuoteNo:   quoteItem.QuoteNo,
		ProductID: quoteItem.ProductID,
		Quantity:  quoteItem.Quantity,
		UnitPrice: quoteItem.UnitPrice,
		SubTotal:  quoteItem.SubTotal,
		Note:      quoteItem.Note,
		CreatedAt: quoteItem.CreatedAt,
	}
}

type UpdateFullQuoteRequest struct {
	Customer UpdateCustomerRequest    `json:"customer" validate:"required"`
	Quote    UpdateQuoteRequest       `json:"quote" validate:"required"`
	Items    UpdateQuoteitemIdRequest `json:"quote_items" validate:"required"`
}
type UpdateFullQuoteResponse struct {
	QuoteID           uuid.UUID                  `gorm:"type:uuid;primary_key" json:"id"`
	CustomerID        uuid.UUID                  `gorm:"type:uuid;primary_key" json:"customer_id"`
	FirstName         string                     `json:"first_name"`
	LastName          string                     `json:"last_name"`
	Address           string                     `json:"address"`
	PhoneNo1          string                     `json:"phone_no1"`
	PhoneNo2          string                     `json:"phone_no2"`
	Email             string                     `json:"email"`
	CreatedBy         uuid.UUID                  `gorm:"type:uuid;primary_key" json:"created_by"`
	QuoteNo           string                     `json:"quote_no"`
	SubTotal          float64                    `json:"subtotal"`
	AdditionalCharges []AdditionalChargeForQuote `json:"additional_charges,omitempty"`
	Discount          float64                    `json:"discount,omitempty"`
	Total             float64                    `json:"total"`
	Vat               bool                       `json:"vat"`
	IsCatalog         bool                       `json:"is_catalog"`
	Status            string                     `json:"status"`
	Items             []CreateQuoteItemResponse  `json:"items"`
	PoNo              string                     `json:"PoNo"`
	CreatedAt         time.Time                  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time                  `gorm:"autoUpdateTime" json:"updated_at"`
}

type GetQuoteTypeResponse struct {
	QuoteNumbers map[string]string `json:"quote_numbers"`
}

// CreateNewOrder
// CreateOrderRequst represents the request body for creating a new order
type AdditionalCharge struct {
	Type  string  `json:"type"`
	Value float64 `json:"value"`
}

type CreateOrderRequest struct {
	Type                 string             `json:"Type" validate:"required"`
	OrderNo              string             `json:"OrderNo" validate:"required"`
	SubTotal             float64            `json:"SubTotal" validate:"required"`
	AdditionalCharges    []AdditionalCharge `json:"additional_charges,omitempty"`
	Discount             float64            `json:"Discount,omitempty"`
	Total                float64            `json:"Total" validate:"required"`
	Vat                  bool               `json:"Vat" validate:"required"`
	CreatedBy            string             `json:"CreatedBy" validate:"required"`
	PaymentStatus        string             `json:"PaymentStatus" validate:"required"`
	ExpectedDeliveryDate time.Time          `json:"ExpectedDeliveryDate,omitempty"`
	PoNo                 string             `josn:"PoNo,omitempty"`
	SalesID              string             `json:"SalesID,omitempty"`
	OrderCreatedBy       string             `json:"OrderCreatedBy,omitempty"`
}

// CreateOrderResponce represents the response body for creating a new order
type CreateOrderResponse struct {
	OrderID              uuid.UUID          `gorm:"type:uuid;primary_key" json:"id"`
	CustomerID           uuid.UUID          `gorm:"type:uuid;primary_key" json:"customer_id"`
	CreatedBy            string             `json:"OrderCreatedBy"`
	Type                 string             `json:"type"`
	OrderNo              string             `json:"order_no"`
	SubTotal             float64            `json:"subtotal"`
	AdditionalCharges    []AdditionalCharge `json:"additional_charges"`
	Discount             float64            `json:"discount,omitempty"`
	Total                float64            `json:"total"`
	Vat                  bool               `json:"vat"`
	OrderStatus          string             `json:"OrderStatus"`
	PaymentStatus        string             `json:"PaymentStatus"`
	ExpectedDeliveryDate time.Time          `json:"ExpectedDeliveryDate,omitempty"`
	PoNo                 string             `json:"PoNo"`
	SalesID              uuid.UUID          `json:"SalesID"`
	CreatedAt            time.Time          `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt            time.Time          `gorm:"autoUpdateTime" json:"updated_at"`
}

func convertAdditionalChargesFromDomain(domainCharges []domain.AdditionalCharge) []AdditionalCharge {
	var charges []AdditionalCharge
	for _, c := range domainCharges {
		charges = append(charges, AdditionalCharge{
			Type:  c.Type,
			Value: c.Value,
		})
	}
	return charges
}

// NewOrderResponse creates a new OrderResponse instance from a domain.Order
func NewOrderResponse(o *domain.Order) *CreateOrderResponse {
	return &CreateOrderResponse{
		OrderID:              o.OrderID,
		CustomerID:           o.CustomerID,
		CreatedBy:            o.CreatedBy,
		Type:                 o.Type,
		OrderNo:              o.OrderNo,
		SubTotal:             o.SubTotal,
		AdditionalCharges:    convertAdditionalChargesFromDomain(o.AdditionalCharges),
		Discount:             o.Discount,
		Total:                o.Total,
		Vat:                  o.Vat,
		OrderStatus:          o.OrderStatus,
		PaymentStatus:        o.PaymentStatus,
		ExpectedDeliveryDate: o.ExpectedDeliveryDate,
		PoNo:                 o.PoNo,
		SalesID:              o.SalesID,
		CreatedAt:            o.CreatedAt,
		UpdatedAt:            o.UpdatedAt,
	}
}

// CreateOrderItemRequest represents the request body for creating a new order item
type CreateOrderItemRequest struct {
	Items []struct {
		ProductID uuid.UUID `json:"product_id" validate:"required"`
		Quantity  int       `json:"quantity,omitempty" validate:"required"`
		UnitPrice float64   `json:"unit_price,omitempty"`
		SubTotal  float64   `json:"subtotal"`
		Note      string    `json:"note,omitempty"`
	} `json:"items" validate:"required,dive"`
}

// CreateQuoteItemResponse represents the response body for creating a new quote item
type CreateOrderItemResponse struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	OrderNo   uuid.UUID `gorm:"type:uuid;primary_key" json:"OrderNo"`
	ProductID uuid.UUID `gorm:"type:uuid;primary_key" json:"product_id"`
	Quantity  int       `json:"Quantity,omitempty"`
	UnitPrice float64   `json:"unit_price,omitempty"`
	SubTotal  float64   `json:"SubTotal"`
	Note      string    `json:"Note,omitempty"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// NewQuoteItemResponse creates a new QuoteItemResponse instance from a domain.QuoteItem
func NewOrderItemResponse(orderItem *domain.OrderItem) *CreateOrderItemResponse {
	return &CreateOrderItemResponse{
		ID:        orderItem.ID,
		OrderNo:   *orderItem.OrderNo,
		ProductID: orderItem.ProductID,
		Quantity:  orderItem.Quantity,
		UnitPrice: orderItem.UnitPrice,
		// SubTotal:  orderItem.SubTotal,
		Note:      orderItem.Note,
		CreatedAt: orderItem.CreatedAt,
	}
}

type CreateOrderPaymentRequest struct {
	PaymentType domain.PaymentType `json:"payment_type" validate:"required"`
	PaymentMode string             `json:"payment_mode" validate:"required"`
	Amount      float64            `json:"amount" validate:"required"`
	LoanAmount  float64            `json:"loan_amount" validate:"required"`
	PaidDate    string             `json:"paid_date" validate:"required"`
	Image       string             `json:"image" validate:"required"`
	CreatedBy   string             `json:"created_by" validate:"required"`
}

type CreateOrderPaymentResponse struct {
	ID          uuid.UUID          `gorm:"type:uuid;primary_key" json:"id"`
	OrderID     uuid.UUID          `gorm:"type:uuid;primary_key" json:"order_id"`
	PaymentType domain.PaymentType `json:"payment_type"`
	PaymentMode string             `json:"payment_mode" `
	Amount      float64            `json:"amount"`
	LoanAmount  float64            `json:"loan_amount"`
	PaidDate    string             `json:"paid_date"`
	Image       string             `json:"image"`
	CreatedBy   string             `json:"created_by"`
}

func NewCreateOrderPaymentResponse(payment *domain.Payment) *CreateOrderPaymentResponse {
	return &CreateOrderPaymentResponse{
		ID:          payment.ID,
		OrderID:     payment.OrderID,
		PaymentType: payment.PaymentType,
		PaymentMode: payment.PaymentMode,
		Amount:      payment.Amount,
		LoanAmount:  payment.LoanAmount,
		PaidDate:    payment.PaidDate,
		Image:       payment.Image,
		CreatedBy:   payment.CreatedBy,
	}
}

// CreateFullOrderRequest represents the request body for creating a new order with customer and items
type CreateFullOrderRequest struct {
	Customer CreateCustomerRequest     `json:"customer" validate:"required"`
	Order    CreateOrderRequest        `json:"order" validate:"required"`
	Items    CreateOrderItemRequest    `json:"order_items" validate:"required"`
	Payments CreateOrderPaymentRequest `json:"payments" validate:"required"`
}

// CreateFullOrderResponse represents the response body for creating a new order with customer and items
type CreateFullOrderResponse struct {
	OrderID    uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	SalesID    uuid.UUID `gorm:"type:uuid;primary_key" json:"SalesID"`
	CustomerID uuid.UUID `gorm:"type:uuid;primary_key" json:"customer_id"`
	FirstName  string    `json:"first_name"`
	LastName   string    `json:"last_name"`
	Address    string    `json:"address"`
	PhoneNo1   string    `json:"phone_no1"`
	PhoneNo2   string    `json:"phone_no2"`
	Email      string    `json:"email"`
	VatNo      string    `json:"vat_no"`
	// PoNo                 string                    `json:"ti_no"`
	Type                 string                    `json:"type"`
	OrderNo              string                    `json:"order_no"`
	SubTotal             float64                   `json:"subtotal"`
	AdditionalCharges    json.RawMessage           `json:"additional_charges"`
	Discount             float64                   `json:"discount,omitempty"`
	Total                float64                   `json:"total"`
	Vat                  bool                      `json:"vat"`
	OrderStatus          string                    `json:"order_status"`
	PaymentStatus        string                    `json:"payment_status"`
	Items                []CreateOrderItemResponse `json:"items"`
	ExpectedDeliveryDate time.Time                 `json:"ExpectedDeliveryDate,omitempty"`
	PaymentType          domain.PaymentType        `json:"payment_type"`
	PaymentMode          string                    `json:"payment_mode"`
	Amount               int                       `json:"amount"`
	LoanAmount           int                       `json:"loan_amount"`
	PaidDate             string                    `json:"paid_date"`
	Image                string                    `json:"image"`
	PoNo                 string                    `json:"po_no"`
	CreatedBy            string                    `json:"created_by"`
	CreatedAt            time.Time                 `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt            time.Time                 `gorm:"autoUpdateTime" json:"updated_at"`
}

// GetOrderResponse represents the response body for retrieving a list of orders
type OrderResponse struct {
	ID                   uuid.UUID `json:"id"`
	Type                 string    `json:"type"`
	OrderN0              string    `json:"order_no"`
	FirstName            string    `json:"first_name"`
	LastName             string    `json:"last_name"`
	Total                float64   `json:"total_price"`
	OrderStatus          string    `json:"order_status"`
	PaymentStatus        string    `json:"payment_status"`
	ExpectedDeliveryDate time.Time `json:"ExpectedDeliveryDate,omitempty"`
	Vat                  bool      `json:"vat"`
	// PaidAmount           float64   `json:"paid_amount"`
	// AdvancedAmount       float64   `json:"advanced_amount"`
	// AdvancedPaidDate     time.Time `json:"advanced_paid_date"`
	// FullAmountPaidDate   string    `json:"full_amount_paid_date"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// NewGetOrderResponse creates a new GetOrderResponse instance from a slice of domain.Order
func NewGetOrderResponse(orders []*domain.Order) []OrderResponse {
	var response []OrderResponse
	for _, q := range orders {
		response = append(response, OrderResponse{
			ID:                   q.OrderID,
			Type:                 q.Type,
			OrderN0:              q.OrderNo,
			FirstName:            q.Customer.FirstName,
			LastName:             q.Customer.LastName,
			Total:                q.Total,
			Vat:                  q.Vat,
			OrderStatus:          q.OrderStatus,
			PaymentStatus:        q.PaymentStatus,
			ExpectedDeliveryDate: q.ExpectedDeliveryDate,
			// PaidAmount:           q.PaidAmount,
			// AdvancedAmount:       q.AdvancedAmount,
			// AdvancedPaidDate:     q.AdvancedPaidDate,
			// FullAmountPaidDate:   q.FullAmountPaidDate,
			CreatedAt: q.CreatedAt,
			UpdatedAt: q.UpdatedAt,
		})
	}
	return response
}

type GetAllQuotesDetailsResponse struct {
	QuoteID           uuid.UUID                  `gorm:"type:uuid;primary_key" json:"id"`
	CustomerID        uuid.UUID                  `gorm:"type:uuid;primary_key" json:"customer_id"`
	Title             string                     `json:"title"`
	FirstName         string                     `json:"first_name"`
	LastName          string                     `json:"last_name"`
	Address           string                     `json:"address"`
	PhoneNo1          string                     `json:"phone_no1"`
	PhoneNo2          string                     `json:"phone_no2"`
	Email             string                     `json:"email"`
	VatNo             string                     `json:"vat_no"`
	CreatedBy         string                     `json:"created_by"`
	Type              string                     `json:"type"`
	QuoteNo           string                     `json:"quote_no"`
	SubTotal          float64                    `json:"subtotal"`
	AdditionalCharges []AdditionalChargeForQuote `json:"additional_charges"`
	Discount          float64                    `json:"discount,omitempty"`
	Total             float64                    `json:"total"`
	Vat               bool                       `json:"vat"`
	Status            string                     `json:"status"`
	Items             []QuoteItemResponse        `json:"items"`
	PoNo              string                     `json:"po_no"`
	SalesID           uuid.UUID                  `json:"sales_id"`
	SalesNo           string                     `json:"sales_no"`
	SalespesonId      uuid.UUID                  `json:"salesperson_id"`
	Salesperson       string                     `json:"salesperson"`
	SaleType          string                     `json:"sales_type"`
	Commission        float64                    `json:"commission"`
	Date              time.Time                  `json:"date"`
	Description       string                     `json:"description"`
	RecordingURL      string                     `json:"recording_url"`
	CreatedAt         time.Time                  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time                  `gorm:"autoUpdateTime" json:"updated_at"`
}

func NewGetAllQuotesDetailsResponse(quotes []*domain.Quote) []GetAllQuotesDetailsResponse {
	var responses []GetAllQuotesDetailsResponse
	for _, q := range quotes {
		var items []QuoteItemResponse
		for _, item := range q.QuoteItems {
			productName := ""
			if item.ProductName != nil {
				productName = item.ProductName.Name
			}
			items = append(items, QuoteItemResponse{
				ID:          item.ID,
				QuoteNo:     item.QuoteNo,
				ProductID:   item.ProductID,
				ProductName: productName,
				Quantity:    item.Quantity,
				UnitPrice:   item.UnitPrice,
				SubTotal:    item.SubTotal,
				Note:        item.Note,
				CreatedAt:   item.CreatedAt,
			})
		}
		title, firstName, lastName, address, phoneNo1, phoneNo2, email, vatNo := "", "", "", "", "", "", "", ""
		if q.Customer != nil {
			title = q.Customer.Title
			firstName = q.Customer.FirstName
			lastName = q.Customer.LastName
			address = q.Customer.Address
			phoneNo1 = q.Customer.PhoneNo1
			phoneNo2 = q.Customer.PhoneNo2
			email = q.Customer.Email
			vatNo = q.Customer.VatNo
		}
		var salesID uuid.UUID
		var salespersonID uuid.UUID
		salesNo, saleType, salesperson, description, recordingURL := "", "", "", "", ""
		var commission float64
		var saleDate time.Time

		// 2. Safely extract Sale data
		if q.Sale != nil {
			salesID = q.Sale.SalesID
			salesNo = q.Sale.SalesNo
			saleType = q.Sale.SalesType
			var commissionV float64
			if q.Sale != nil && q.Sale.Commission != nil {
				commissionV = *q.Sale.Commission
			}
			commission = commissionV
			saleDate = q.Sale.Date
			description = q.Sale.Description
			recordingURL = q.Sale.RecordingURL
			salespersonID = q.Sale.Salesperson
			if q.Sale.SalespersonData != nil {
				salesperson = q.Sale.SalespersonData.FirstName + " " + q.Sale.SalespersonData.LastName
			}
		}
		responses = append(responses, GetAllQuotesDetailsResponse{
			QuoteID:           q.QuoteID,
			CustomerID:        q.CustomerID,
			Title:             title,
			FirstName:         firstName,
			LastName:          lastName,
			Address:           address,
			PhoneNo1:          phoneNo1,
			PhoneNo2:          phoneNo2,
			Email:             email,
			VatNo:             vatNo,
			CreatedBy:         q.CreatedBy,
			Type:              q.Type,
			QuoteNo:           q.QuoteNo,
			SubTotal:          q.SubTotal,
			AdditionalCharges: convertAdditionalChargesForQuoteFromDomain(q.AdditionalCharges),
			Discount:          q.Discount,
			Total:             q.Total,
			Vat:               q.Vat,
			Status:            q.Status,
			Items:             items,
			PoNo:              q.PoNo,
			SalesID:           salesID,
			SalesNo:           salesNo,
			SaleType:          saleType,
			SalespesonId:      salespersonID,
			Salesperson:       salesperson,
			Commission:        commission,
			Date:              saleDate,
			Description:       description,
			RecordingURL:      recordingURL,
			CreatedAt:         q.CreatedAt,
			UpdatedAt:         q.UpdatedAt,
		})
	}
	return responses
}

type GetLastOrderTypeResponse struct {
	OrderNumbers map[string]string `json:"order_numbers"`
}

type GetOrdersRequest struct {
	Query         string `form:"query"`
	Vat           string `form:"vat"`
	OrderStatus   string `form:"orderStatus"`
	PaymentStatus string `form:"paymentStatus"`
	Limit         int    `form:"limit"`
	Offset        int    `form:"offset"`
}

type OrdersResponse struct {
	ID                   uuid.UUID `json:"id"`
	Type                 string    `json:"type"`
	OrderN0              string    `json:"order_no"`
	FirstName            string    `json:"first_name"`
	LastName             string    `json:"last_name"`
	Total                float64   `json:"total_price"`
	Vat                  bool      `json:"vat"`
	OrderStatus          string    `json:"order_status"`
	PaymentStatus        string    `json:"payment_status"`
	ExpectedDeliveryDate time.Time `json:"ExpectedDeliveryDate,omitempty"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}
type GetOrdersResponse struct {
	Orders      []OrdersResponse `json:"orders"`
	Total       int              `json:"total"`
	TotalOrders int              `json:"total_orders"`
}

func NewGetAllOrdersResponse(orders []*domain.Order, totalOrders int) *GetOrdersResponse {
	var responses []OrdersResponse
	for _, q := range orders {
		responses = append(responses, OrdersResponse{
			ID:                   q.OrderID,
			Type:                 q.Type,
			OrderN0:              q.OrderNo,
			FirstName:            q.Customer.FirstName,
			LastName:             q.Customer.LastName,
			Total:                q.Total,
			Vat:                  q.Vat,
			OrderStatus:          q.OrderStatus,
			PaymentStatus:        q.PaymentStatus,
			ExpectedDeliveryDate: q.ExpectedDeliveryDate,
			CreatedAt:            q.CreatedAt,
			UpdatedAt:            q.UpdatedAt,
		})
	}
	return &GetOrdersResponse{
		Orders:      responses,
		Total:       len(orders),
		TotalOrders: totalOrders,
	}
}

type UpdateOrderIdRequest struct {
	OrderID string `uri:"order-id" json:"order-id"`
}
type CADFile struct {
	FileName []string `json:"file_name"`
	Email    []string `json:"email"`
	Quantity int      `json:"quantity"`
}
type Designer struct {
	Email       []string `json:"email"`
	Description string   `json:"description"`
}
type ApproveOrderRequest struct {
	Assignee   []string `json:"assignee,omitempty" validate:"required"`
	Supervisor string   `json:"supervisor,omitempty" validate:"required"`
	CADFile    CADFile  `json:"cad_files,omitempty" validate:"required"`
	Designer   Designer `json:"designer,omitempty" validate:"required"`
}
type ApproveOrderResponse struct {
	Assignee   []string `json:"assignee"`
	Supervisor string   `json:"supervisor"`
	CADFiles   CADFile  `json:"cad_files"`
	Designer   Designer `json:"designer"`
}

type UpdateOrderRequest struct {
	OrderNo           string             `json:"OrderNo,omitempty" validate:"required"`
	SubTotal          float64            `json:"SubTotal,omitempty" validate:"required"`
	Discount          float64            `json:"Discount,omitempty"`
	AdditionalCharges []AdditionalCharge `json:"additional_charges,omitempty"`
	Total             float64            `json:"Total,omitempty" validate:"required"`
	Vat               bool               `json:"Vat,omitempty" validate:"required"`
	OrderStatus       string             `json:"OrderStatus,omitempty" validate:"required"`
	PoNo              string             `json:"PoNo,omitempty"`
	SalesID           uuid.UUID          `json:"SalesID,omitempty"`
	PaymentStatus     string             `json:"PaymentStatus,omitempty" validate:"required"`
}
type UpdateOrderResponse struct {
	OrderID           uuid.UUID          `gorm:"type:uuid;primary_key" json:"id"`
	CustomerID        uuid.UUID          `gorm:"type:uuid;primary_key" json:"customer_id"`
	CreatedBy         string             `json:"created_by"`
	OrderNo           string             `json:"order_no"`
	SubTotal          float64            `json:"subtotal"`
	AdditionalCharges []AdditionalCharge `json:"additional_charges"`
	Discount          float64            `json:"discount,omitempty"`
	Total             float64            `json:"total"`
	Vat               bool               `json:"Vat"`
	OrderStatus       string             `json:"OrderStatus"`
	PaymentStatus     string             `json:"PaymentStatus"`
	PoNo              string             `json:"PoNo"`
	SalesID           uuid.UUID          `json:"SalesID,omitempty"`
	CreatedAt         time.Time          `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time          `gorm:"autoUpdateTime" json:"updated_at"`
}

func convertCADFilesFromDomain(domainCADFile domain.CADFile) CADFile {
	return CADFile{
		FileName: domainCADFile.FileName,
		Email:    domainCADFile.Email,
		Quantity: domainCADFile.Quantity,
	}
}
func convertDesignerFromDomain(domainDesigner domain.Designer) Designer {
	return Designer{
		Email:       domainDesigner.Email,
		Description: domainDesigner.Description,
	}
}

func NewUpdateOrderResponse(order *domain.Order) *UpdateOrderResponse {
	return &UpdateOrderResponse{
		OrderID:           order.OrderID,
		CustomerID:        order.CustomerID,
		CreatedBy:         order.CreatedBy,
		OrderNo:           order.OrderNo,
		SubTotal:          order.SubTotal,
		AdditionalCharges: convertAdditionalChargesFromDomain(order.AdditionalCharges),
		Discount:          order.Discount,
		Total:             order.Total,
		Vat:               order.Vat,
		OrderStatus:       order.OrderStatus,
		PaymentStatus:     order.PaymentStatus,
		CreatedAt:         order.CreatedAt,
		PoNo:              order.PoNo,
		SalesID:           order.SalesID,
		UpdatedAt:         order.UpdatedAt,
	}
}

func NewApproveOrderResponse(order *domain.Order) *ApproveOrderResponse {

	return &ApproveOrderResponse{
		Assignee:   order.Assignee,
		Supervisor: order.Supervisor,
		CADFiles:   convertCADFilesFromDomain(order.CADFiles),
		Designer:   convertDesignerFromDomain(order.Designer),
	}
}

type UpdateOrderItemRequest struct {
	Items []struct {
		ID        *uuid.UUID `json:"id,omitempty"`
		ProductID uuid.UUID  `json:"product_id" validate:"required"`
		Quantity  int        `json:"quantity" validate:"required"`
		UnitPrice float64    `json:"unit_price,omitempty"`
		SubTotal  float64    `json:"subtotal"`
		Note      string     `json:"note,omitempty"`
	} `json:"items" validate:"required,dive"`
}
type UpdateOrderItemResponse struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	OrderNo   uuid.UUID `gorm:"foreignKey:OrderNo" json:"order_no"`
	ProductID uuid.UUID `gorm:"foreignKey:ProductID" json:"product_id"`
	Quantity  int       `json:"Quantity,omitempty"`
	UnitPrice float64   `json:"unit_price,omitempty"`
	SubTotal  float64   `json:"SubTotal"`
	Note      string    `json:"Note,omitempty"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func NewUpdateOrderItemResponse(orderItem *domain.OrderItem) *UpdateOrderItemResponse {
	return &UpdateOrderItemResponse{
		ID:        orderItem.ID,
		OrderNo:   *orderItem.OrderNo,
		ProductID: orderItem.ProductID,
		Quantity:  orderItem.Quantity,
		UnitPrice: orderItem.UnitPrice,
		// SubTotal:  orderItem.SubTotal,
		Note:      orderItem.Note,
		CreatedAt: orderItem.CreatedAt,
	}
}

type UpdateOrderPaymentRequest struct {
	ID          uuid.UUID          `json:"id"`
	PaymentType domain.PaymentType `json:"payment_type"`
	PaymentMode string             `json:"payment_mode" `
	Amount      float64            `json:"amount" `
	LoanAmount  float64            `json:"loan_amount"`
	PaidDate    string             `json:"paid_date"`
	Image       string             `json:"image" `
	CreatedBy   string             `json:"created_by"`
}
type UpdateOrderPaymentResponse struct {
	ID          uuid.UUID          `json:"id"`
	OrderID     uuid.UUID          `json:"order_id"`
	PaymentType domain.PaymentType `json:"payment_type"`
	PaymentMode string             `json:"payment_mode" `
	Amount      float64            `json:"amount"`
	LoanAmount  float64            `json:"loan_amount"`
	PaidDate    string             `json:"paid_date"`
	Image       string             `json:"image"`
	Status      string             `json:"status"`
	CreatedBy   string             `json:"created_by"`
}

type UpdateOrderFullRequest struct {
	Customer UpdateCustomerRequest     `json:"customer"`
	Order    UpdateOrderRequest        `json:"order" validate:"required"`
	Items    UpdateOrderItemRequest    `json:"order_items" validate:"required"`
	Payments UpdateOrderPaymentRequest `json:"payments" validate:"required"`
}
type UpdateFullOrderResponse struct {
	OrderID              uuid.UUID                    `gorm:"type:uuid;primary_key" json:"id"`
	CustomerID           uuid.UUID                    `gorm:"type:uuid;primary_key" json:"customer_id"`
	FirstName            string                       `json:"first_name"`
	LastName             string                       `json:"last_name"`
	Address              string                       `json:"address"`
	PhoneNo1             string                       `json:"phone_no1"`
	PhoneNo2             string                       `json:"phone_no2"`
	Email                string                       `json:"email"`
	VatNo                string                       `json:"vat_no"`
	CreatedBy            string                       `json:"created_by"`
	Type                 string                       `json:"type"`
	OrderNo              string                       `json:"order_no"`
	SubTotal             float64                      `json:"subtotal"`
	Discount             float64                      `json:"discount,omitempty"`
	Total                float64                      `json:"total"`
	Vat                  bool                         `json:"vat"`
	OrderStatus          string                       `json:"order_status"`
	PaymentStatus        string                       `json:"payment_status"`
	ExpectedDeliveryDate time.Time                    `json:"expected_delivery_date,omitempty"`
	Items                []UpdateOrderItemResponse    `json:"order_items"`
	Payments             []UpdateOrderPaymentResponse `json:"payments"`
	Assignee             []uuid.UUID                  `gorm:"type:uuid;foreignKey:Assignee;references:ID" json:"assignee"`
	Supervisor           string                       `json:"supervisor"`
	CADFiles             CADFile                      `json:"cad_files"`
	Designer             Designer                     `json:"designer"`
	PoNo                 string                       `json:"po_no"`
	SalesID              uuid.UUID                    `json:"sales_id"`
	CreatedAt            time.Time                    `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt            time.Time                    `gorm:"autoUpdateTime" json:"updated_at"`
}

// UpdateQuoteStatusRequest represents the request body for updating a quote status
type UpdateOrderStatusRequest struct {
	OrderID       string `json:"id" binding:"required" validate:"required"`
	PaymentStatus string `json:"PaymentStatus,omitempty"`
	OrderStatus   string `json:"OrderStatus,omitempty"`
	QcProof       string `json:"QcProof,omitempty"`
	DeliveryProof string `json:"DeliveryProof,omitempty"`
}

// UpdateQuoteStatusResponse represents the response body for updating a quote status
type UpdateOrderStatusResponse struct {
	OrderID uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	OrderNo string    `json:"orderNo"`
}

// NewUpdateQuoteStatusResponse creates a new UpdateQuoteStatusResponse instance from a domain.Quote
func NewUpdateOrderStatusResponse(order *domain.Order) *UpdateOrderStatusResponse {
	return &UpdateOrderStatusResponse{
		OrderID: order.OrderID,
		OrderNo: order.OrderNo,
	}
}

type GetOrderIdRequest struct {
	OrderID string `uri:"order-id" binding:"required" json:"order-id"`
}
type GetOrderItemResponse struct {
	ID            uuid.UUID `json:"id"`
	OrderNo       uuid.UUID `gorm:"foreignKey:OrderNo" json:"order_no"`
	ProductID     uuid.UUID `gorm:"foreignKey:ProductID" json:"product_id"`
	SerialNo      string    `json:"serial_no"`
	ProductName   string    `json:"product_name"`
	Quantity      int       `json:"quantity"`
	UnitPrice     float64   `json:"unit_price"`
	SubTotal      float64   `json:"subtotal"`
	Note          string    `json:"note"`
	QcProof       string    `json:"qc_proof"`
	DeliveryProof string    `json:"delivery_proof"`
	CreatedAt     time.Time `json:"created_at"`
}

type GetOrderPaymentResponse struct {
	ID          uuid.UUID          `json:"id"`
	PaymentType domain.PaymentType `json:"payment_type"`
	PaymentMode string             `json:"payment_mode"`
	Amount      float64            `json:"amount"`
	LoanAmount  float64            `json:"loan_amount"`
	PaidDate    string             `json:"paid_date"`
	Image       string             `json:"image"`
	Status      string             `json:"status"`
	CreatedBy   string             `json:"created_by"`
}

type GetSaleResponse struct {
	ID           uuid.UUID `json:"id"`
	SalesNo      string    `json:"sales_no"`
	Salesperson  uuid.UUID `json:"salesperson"`
	SaleType     string    `json:"sales_type"`
	Commission   float64   `json:"commission"`
	Date         time.Time `json:"date"`
	Description  string    `json:"description"`
	RecordingURL string    `json:"recording_url"`
}
type OrderItemSummaryResponse struct {
	ProductID uuid.UUID `json:"product_id"`
	UnitPrice float64   `json:"unit_price"`
	Quantity  int       `json:"quantity"`
}

type GetOrderByIdResponse struct {
	OrderID              uuid.UUID                  `gorm:"type:uuid;primary_key" json:"id"`
	CustomerID           uuid.UUID                  `gorm:"type:uuid;foreign_Key:CustomerID" json:"customer_id"`
	Title                string                     `json:"title"`
	FirstName            string                     `json:"first_name"`
	LastName             string                     `json:"last_name"`
	Address              string                     `json:"address"`
	PhoneNo1             string                     `json:"phone_no1"`
	PhoneNo2             string                     `json:"phone_no2"`
	Email                string                     `json:"email"`
	VatNo                string                     `json:"vat_no"`
	CreatedBy            string                     `json:"created_by"`
	Type                 string                     `json:"type"`
	OrderNo              string                     `json:"order_no"`
	SubTotal             float64                    `json:"subtotal"`
	AdditionalCharges    []AdditionalCharge         `json:"additional_charges"`
	Discount             float64                    `json:"discount,omitempty"`
	Total                float64                    `json:"total"`
	Vat                  bool                       `json:"vat"`
	OrderStatus          string                     `json:"OrderStatus"`
	PaymentStatus        string                     `json:"PaymentStatus"`
	ExpectedDeliveryDate time.Time                  `json:"expected_delivery_date,omitempty"`
	OrderItems           []GetOrderItemResponse     `json:"order_items"`
	Payments             []GetOrderPaymentResponse  `json:"payments"`
	Assignee             []string                   `json:"assignee"`
	Supervisor           string                     `json:"supervisor"`
	CADFiles             CADFile                    `json:"cad_files"`
	Designer             Designer                   `json:"designer"`
	PoNo                 string                     `json:"po_no"`
	SalesID              uuid.UUID                  `json:"sales_id"`
	SalesNo              string                     `json:"sales_no"`
	Salesperson          string                     `json:"salesperson"`
	SalespersonPhone     string                     `json:"salesperson_phone"`
	SaleType             string                     `json:"sales_type"`
	Commission           float64                    `json:"commission"`
	Date                 time.Time                  `json:"date"`
	Description          string                     `json:"description"`
	RecordingURL         string                     `json:"recording_url"`
	QcProof              string                     `json:"qc_proof"`
	DeliveryProof        string                     `json:"delivery_proof"`
	Items                []OrderItemSummaryResponse `json:"items_summary"`
	CreatedAt            time.Time                  `json:"created_at"`
	UpdatedAt            time.Time                  `json:"updated_at"`
}

func NewGetOrderByIdResponse(order *domain.Order) *GetOrderByIdResponse {
	if order == nil {
		return &GetOrderByIdResponse{}
	}

	var items []GetOrderItemResponse
	assignedCounts := make(map[uuid.UUID]int)

	batteryPackPrices := make(map[uuid.UUID]float64)
	for _, summaryItem := range order.Items {
		batteryPackPrices[summaryItem.ProductID] = summaryItem.UnitPrice
	}

	for _, item := range order.OrderItems {
		productName := ""
		if item.ProductName != nil {
			productName = item.ProductName.Name
		}
		var safeOrderNo uuid.UUID
		if item.OrderNo != nil {
			safeOrderNo = *item.OrderNo
		}

		assignedCounts[item.ProductID] += item.Quantity

		finalUnitPrice := item.UnitPrice
		if summaryPrice, isBatteryPack := batteryPackPrices[item.ProductID]; isBatteryPack {
			finalUnitPrice = summaryPrice
		}

		items = append(items, GetOrderItemResponse{
			ID:          item.ID,
			OrderNo:     safeOrderNo,
			ProductID:   item.ProductID,
			SerialNo:    item.SerialNo,
			ProductName: productName,
			Quantity:    item.Quantity,
			UnitPrice:   finalUnitPrice,
			// SubTotal:    item.SubTotal,
			Note:      item.Note,
			CreatedAt: item.CreatedAt,
		})
	}

	for _, summaryItem := range order.Items {

		pendingQty := summaryItem.Quantity - assignedCounts[summaryItem.ProductID]

		for i := 0; i < pendingQty; i++ {
			items = append(items, GetOrderItemResponse{
				ID:          uuid.Nil,
				OrderNo:     order.OrderID,
				ProductID:   summaryItem.ProductID,
				SerialNo:    "",
				ProductName: summaryItem.ProductName,
				Quantity:    1,
				UnitPrice:   summaryItem.UnitPrice,
				Note:        summaryItem.Note,
			})
		}
	}

	var payments []GetOrderPaymentResponse
	for _, p := range order.Payments {
		creator := ""
		if p.User != nil {
			creator = p.User.FirstName + " " + p.User.LastName
		}

		payments = append(payments, GetOrderPaymentResponse{
			ID:          p.ID,
			PaymentType: p.PaymentType,
			PaymentMode: p.PaymentMode,
			Amount:      p.Amount,
			LoanAmount:  p.LoanAmount,
			PaidDate:    p.PaidDate,
			Image:       p.Image,
			Status:      p.Status,
			CreatedBy:   creator,
		})
	}

	var salesID uuid.UUID
	salesNo, saleType, salesperson, salespersonPhone, description, recordingURL := "", "", "", "", "", ""
	var commission float64
	var saleDate time.Time

	if order.Sale != nil {
		salesID = order.Sale.SalesID
		salesNo = order.Sale.SalesNo
		saleType = order.Sale.SalesType
		if order.Sale != nil && order.Sale.Commission != nil {
			commission = *order.Sale.Commission
		}
		saleDate = order.Sale.Date
		description = order.Sale.Description
		recordingURL = order.Sale.RecordingURL

		if order.Sale.SalespersonData != nil {
			salesperson = order.Sale.SalespersonData.FirstName + " " + order.Sale.SalespersonData.LastName
			salespersonPhone = order.Sale.SalespersonData.PhoneNo
		}
	}
	title, firstName, lastName, address, phoneNo1, phoneNo2, email, vatNo :=
		"", "", "", "", "", "", "", ""
	if order.Customer != nil {
		title = order.Customer.Title
		firstName = order.Customer.FirstName
		lastName = order.Customer.LastName
		address = order.Customer.Address
		phoneNo1 = order.Customer.PhoneNo1
		phoneNo2 = order.Customer.PhoneNo2
		email = order.Customer.Email
		vatNo = order.Customer.VatNo
	}

	createdBy := ""
	if order.User != nil {
		createdBy = order.User.FirstName + " " + order.User.LastName
	}

	return &GetOrderByIdResponse{
		OrderID:              order.OrderID,
		CustomerID:           order.CustomerID,
		Title:                title,
		FirstName:            firstName,
		LastName:             lastName,
		Address:              address,
		PhoneNo1:             phoneNo1,
		PhoneNo2:             phoneNo2,
		Email:                email,
		VatNo:                vatNo,
		CreatedBy:            createdBy,
		Type:                 order.Type,
		OrderNo:              order.OrderNo,
		SubTotal:             order.SubTotal,
		AdditionalCharges:    convertAdditionalChargesFromDomain(order.AdditionalCharges),
		Discount:             order.Discount,
		Total:                order.Total,
		Vat:                  order.Vat,
		OrderStatus:          order.OrderStatus,
		PaymentStatus:        order.PaymentStatus,
		ExpectedDeliveryDate: order.ExpectedDeliveryDate,
		OrderItems:           items,
		Payments:             payments,
		Assignee:             order.Assignee,
		Supervisor:           order.Supervisor,
		CADFiles:             CADFile(order.CADFiles),
		Designer:             Designer(order.Designer),
		PoNo:                 order.PoNo,
		SalesID:              salesID,
		SalesNo:              salesNo,
		SaleType:             saleType,
		Salesperson:          salesperson,
		SalespersonPhone:     salespersonPhone,
		Commission:           commission,
		Date:                 saleDate,
		Description:          description,
		RecordingURL:         recordingURL,
		QcProof:              order.QcProof,
		DeliveryProof:        order.DeliveryProof,
		CreatedAt:            order.CreatedAt,
		UpdatedAt:            order.UpdatedAt,
	}
}

type DeleteQuoteIdRequest struct {
	QuoteID string `uri:"quote-id" binding:"required" json:"quote-id"`
}

type DeleteQuoteResponse struct {
	QuoteID uuid.UUID `gorm:"type:int;primary_key" json:"id"`
}

func NewDeleteQuoteResponse(quote *domain.Quote) DeleteQuoteResponse {
	return DeleteQuoteResponse{
		QuoteID: quote.QuoteID,
	}
}

type DeleteOrderIdRequest struct {
	OrderID string `uri:"order-id" binding:"required" json:"order-id"`
}

type DeleteOrderResponse struct {
	OrderID uuid.UUID `gorm:"type:int;primary_key" json:"id"`
}

func NewDeleteOrderResponse(order *domain.Order) DeleteOrderResponse {
	return DeleteOrderResponse{
		OrderID: order.OrderID,
	}
}

type OrdersCardResponse struct {
	ID                   uuid.UUID `json:"id"`
	Type                 string    `json:"type"`
	OrderNo              string    `json:"order_no"`
	OrderStatus          string    `json:"order_status"`
	ExpectedDeliveryDate time.Time `json:"ExpectedDeliveryDate,omitempty"`
	Supervisor           string    `json:"supervisor"`
	Assignee             string    `json:"assignee"`
}
type GetOrderItemCardResponse struct {
	ID          uuid.UUID `json:"id"`
	OrderNo     uuid.UUID `gorm:"foreignKey:OrderNo" json:"order_no"`
	ProductID   uuid.UUID `gorm:"foreignKey:ProductID" json:"product_id"`
	ProductName string    `json:"product_name"`
	Quantity    int       `json:"quantity"`
}
type GetOrdersCardResponse struct {
	OrderID              uuid.UUID                  `gorm:"type:uuid;primary_key" json:"id"`
	Type                 string                     `json:"type"`
	OrderNo              string                     `json:"order_no"`
	OrderStatus          string                     `json:"OrderStatus"`
	ExpectedDeliveryDate time.Time                  `json:"expected_delivery_date,omitempty"`
	OrderItems           []GetOrderItemCardResponse `json:"order_items"`
	Assignee             []string                   `json:"assignee"`
	Supervisor           string                     `json:"supervisor"`
}

func NewGetOrderCardResponse(order *domain.Order) *GetOrdersCardResponse {
	var items []GetOrderItemCardResponse
	for _, item := range order.OrderItems {
		items = append(items, GetOrderItemCardResponse{
			ID:          item.ID,
			OrderNo:     *item.OrderNo,
			ProductID:   item.ProductID,
			ProductName: item.ProductName.Name,
			Quantity:    item.Quantity,
		})
	}

	return &GetOrdersCardResponse{
		OrderID:              order.OrderID,
		Type:                 order.Type,
		OrderNo:              order.OrderNo,
		OrderStatus:          order.OrderStatus,
		ExpectedDeliveryDate: order.ExpectedDeliveryDate,
		OrderItems:           items,
		Assignee:             order.Assignee,
		Supervisor:           order.Supervisor,
	}
}
func NewGetOrderCardsResponse(orders []*domain.Order) []*GetOrdersCardResponse {
	var response []*GetOrdersCardResponse
	for _, order := range orders {
		response = append(response, NewGetOrderCardResponse(order))
	}
	return response
}

type UpdateOrderPaymentRefundRequest struct {
	OrderID       uuid.UUID          `json:"id" binding:"required" validate:"required"`
	PaymentID     []uuid.UUID        `json:"PaymentID" binding:"required" validate:"required"`
	PaymentType   domain.PaymentType `json:"PaymentType" binding:"required" validate:"required"`
	PaymentStatus string             `json:"PaymentStatus"`
	OrderStatus   string             `json:"OrderStatus" binding:"required" validate:"required"`
}

type UpdareOrderPaymentRefundResponse struct {
	OrderID uuid.UUID `json:"order_id"`
}

func NewOrderPaymentRefundResponse(order *domain.Order) *UpdareOrderPaymentRefundResponse {
	return &UpdareOrderPaymentRefundResponse{
		OrderID: order.OrderID,
	}
}

type GetPacksRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type GetPackResponse struct {
	ID          uuid.UUID `json:"id"`
	ProductID   uuid.UUID `json:"product_id"`
	ProductName string    `json:"product_name"`
	SerialNo    string    `json:"serial_no"`
	Priority    string    `json:"priority"`
	Status      string    `json:"status"`
	Note        string    `json:"note"`
}
type GetPacksResponse struct {
	Packs      []GetPackResponse `json:"packs"`
	Total      int               `json:"total"`
	TotalPacks int64             `json:"total_packs"`
}

func NewGetPacksResponse(packs []*domain.OrderItem, totalPacks int64) *GetPacksResponse {
	var response []GetPackResponse
	for _, p := range packs {
		productName := ""
		if p.ProductName != nil {
			productName = p.ProductName.Name
		}

		response = append(response, GetPackResponse{
			ID:          p.ID,
			ProductID:   p.ProductID,
			ProductName: productName,
			SerialNo:    p.SerialNo,
			Priority:    p.Priority,
			Status:      p.Status,
			Note:        p.Note,
		})
	}
	return &GetPacksResponse{
		Packs:      response,
		Total:      len(packs),
		TotalPacks: totalPacks,
	}
}

type GetPackByIdRequest struct {
	PackID string `uri:"pack-id" binding:"required" json:"packId"`
}
type GetPackByIdResponse struct {
	ID             uuid.UUID `json:"id"`
	OrderID        uuid.UUID `json:"order_id"`
	OrderNo        string    `json:"order_no"`
	CasingID       uuid.UUID `json:"casing_id"`
	CasingNo       string    `json:"casing_no"`
	WireHarnessID  uuid.UUID `json:"wire_harness_id"`
	WireHarnessNo  string    `json:"wire_harness_no"`
	ProductID      uuid.UUID `json:"product_id"`
	SerialNo       string    `json:"serial_no"`
	Status         string    `json:"status"`
	Notes          string    `json:"note"`
	Category       string    `json:"category"`
	Name           string    `json:"name"`
	Type           string    `json:"type"`
	CellType       string    `json:"cell_type"`
	CellCount      string    `json:"cell_count"`
	Voltage        float64   `json:"voltage"`
	Capacity       float64   `json:"capacity"`
	BmsType        string    `json:"bms_type"`
	SolarPanel     string    `json:"solar_panel"`
	Inverter       string    `json:"inverter"`
	Monitor        string    `json:"monitor"`
	BasePrice      float64   `json:"base_price"`
	Specifications string    `json:"specifications"`
	IsActive       bool      `json:"is_active"`
}

func NewGetPackByIdResponse(pack *domain.OrderItem) *GetPackByIdResponse {
	var orderID uuid.UUID
	var orderNo string
	if pack.OrderNo != nil {
		orderID = *pack.OrderNo

		if pack.Order != nil {
			orderNo = pack.Order.Type + pack.Order.OrderNo
		} else {
			orderNo = "N/A"
		}
	} else {
		orderID = uuid.Nil
		orderNo = ""
	}

	var casingID uuid.UUID
	var casingNo string
	if pack.CasingID != nil {
		casingID = *pack.CasingID
	}
	if pack.Casing != nil {
		casingNo = pack.Casing.SerialNo
	}

	var wireHarnessID uuid.UUID
	var wireHarnessNo string
	if pack.WireHarnessID != nil {
		wireHarnessID = *pack.WireHarnessID
	}
	if pack.WireHarness != nil {
		wireHarnessNo = pack.WireHarness.SerialNo
	}

	var category, name, prodType, cellType, cellCount, bmsType, solarPanel, inverter, monitor, specs string
	var voltage, capacity, basePrice float64
	var isActive bool

	if pack.ProductName != nil {
		category = string(pack.ProductName.Category)
		name = pack.ProductName.Name
		prodType = pack.ProductName.Type
		cellType = pack.ProductName.CellType
		cellCount = pack.ProductName.CellCount
		voltage = pack.ProductName.Voltage
		capacity = pack.ProductName.Capacity
		bmsType = pack.ProductName.BmsType
		solarPanel = pack.ProductName.SolarPanel
		inverter = pack.ProductName.Inverter
		monitor = pack.ProductName.Monitor
		basePrice = pack.ProductName.BasePrice
		specs = pack.ProductName.Specifications
		if pack.ProductName.IsActive != nil {
			isActive = *pack.ProductName.IsActive
		}
	}

	return &GetPackByIdResponse{
		ID:             pack.ID,
		OrderID:        orderID,
		OrderNo:        orderNo,
		CasingID:       casingID,
		CasingNo:       casingNo,
		WireHarnessID:  wireHarnessID,
		WireHarnessNo:  wireHarnessNo,
		ProductID:      pack.ProductID,
		SerialNo:       pack.SerialNo,
		Status:         pack.Status,
		Notes:          pack.Note,
		Category:       category,
		Name:           name,
		Type:           prodType,
		CellType:       cellType,
		CellCount:      cellCount,
		Voltage:        voltage,
		Capacity:       capacity,
		BmsType:        bmsType,
		SolarPanel:     solarPanel,
		Inverter:       inverter,
		Monitor:        monitor,
		BasePrice:      basePrice,
		Specifications: specs,
		IsActive:       isActive,
	}
}

type UpdatePackSRequest struct {
	PackID   string `json:"packId" binding:"required" validate:"required"`
	OrderID  string `json:"orderId,omitempty"`
	Status   string `json:"status,omitempty"`
	SerialNo string `json:"serial_no,omitempty"`
	Priority string `json:"priority,omitempty"`
}

type UpdatePackStatusResponse struct {
	PackID   uuid.UUID `gorm:"type:uuid;primary_key" json:"pack-id"`
	OrderID  uuid.UUID `json:"orderId,omitempty"`
	Status   string    `json:"status,omitempty"`
	SerialNo string    `json:"SerialNo"`
	Priority string    `json:"priority,omitempty"`
}

func NewUpdatePackResponse(pack *domain.OrderItem) *UpdatePackStatusResponse {
	var orderIDVal uuid.UUID
	if pack.OrderNo != nil {
		orderIDVal = *pack.OrderNo
	}

	return &UpdatePackStatusResponse{
		PackID:   pack.ID,
		OrderID:  orderIDVal,
		Status:   pack.Status,
		SerialNo: pack.SerialNo,
		Priority: pack.Priority,
	}
}

type UpdatePacksOrderIDRequest struct {
	PackID          string `json:"packId" binding:"required" validate:"required"`
	ExistingOrderID string `json:"existiongorderId"`
	NewOrderID      string `json:"neworderId"`
}

type UpdatePacksOrderIDResponse struct {
	PackID     uuid.UUID `json:"packId" binding:"required" validate:"required"`
	NewOrderID uuid.UUID `json:"neworderId" binding:"required" validate:"required"`
}

func NewUpdatePacksOrderIDResponse(pack *domain.OrderItem) *UpdatePacksOrderIDResponse {
	return &UpdatePacksOrderIDResponse{
		PackID:     pack.ID,
		NewOrderID: *pack.OrderNo,
	}
}

type CreatePackRequest struct {
	ProductID uuid.UUID `json:"product_id" validate:"required"`
	Quantity  int       `json:"quantity,omitempty"`
	UnitPrice float64   `json:"unit_price,omitempty"`
	Status    string    `json:"status,omitempty"`
	Note      string    `json:"note,omitempty"`
}

// CreateQuoteItemResponse represents the response body for creating a new quote item
type CreatePackResponse struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	SerialNo  string    `json:"serial_no"`
	ProductID uuid.UUID `gorm:"type:uuid;primary_key" json:"product_id"`
	Quantity  int       `json:"Quantity,omitempty"`
	UnitPrice float64   `json:"unit_price,omitempty"`
	Status    string    `json:"status"`
	Note      string    `json:"Note,omitempty"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func NewPackResponse(orderItem *domain.OrderItem) *CreatePackResponse {
	return &CreatePackResponse{
		ID:        orderItem.ID,
		ProductID: orderItem.ProductID,
		SerialNo:  orderItem.SerialNo,
		Quantity:  orderItem.Quantity,
		UnitPrice: orderItem.UnitPrice,
		Status:    orderItem.Status,
		Note:      orderItem.Note,
		CreatedAt: orderItem.CreatedAt,
	}
}

type GetPaymentRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}
type GetOrderPaymentListResponse struct {
	ID          uuid.UUID          `json:"id"`
	OrderNo     string             `json:"order_no"`
	PaymentType domain.PaymentType `json:"payment_type"`
	PaymentMode string             `json:"payment_mode"`
	Amount      float64            `json:"amount"`
	Status      string             `json:"status"`
	PaidDate    string             `json:"paid_date"`
	CreatedBy   string             `json:"created_by"`
}
type GetOrderPaymentListResponses struct {
	Payments      []GetOrderPaymentListResponse `json:"payments"`
	Total         int                           `json:"total"`
	TotalPayments int                           `json:"total_payments"`
}

func NewGetOrderPaymentListResponses(payments []*domain.Payment, totalPayments int) *GetOrderPaymentListResponses {
	var responses []GetOrderPaymentListResponse
	for _, p := range payments {
		creator := ""
		if p.User != nil {
			creator = p.User.FirstName + " " + p.User.LastName
		}
		responses = append(responses, GetOrderPaymentListResponse{
			ID:          p.ID,
			OrderNo:     p.Order.Type + "" + p.Order.OrderNo,
			PaymentType: p.PaymentType,
			PaymentMode: p.PaymentMode,
			Amount:      p.Amount,
			Status:      p.Status,
			PaidDate:    p.PaidDate,
			CreatedBy:   creator,
		})
	}
	return &GetOrderPaymentListResponses{
		Payments:      responses,
		Total:         len(responses),
		TotalPayments: totalPayments,
	}
}

type UpdatePaymentRequest struct {
	ID     uuid.UUID `json:"id"`
	Status string    `json:"status" `
}
type UpdatePaymentResponse struct {
	ID      uuid.UUID `json:"id"`
	OrderNo string    `json:"order_no"`
	Amount  float64   `json:"amount"`
	Status  string    `json:"status"`
}

func NewUpdatePaymentResponse(payment *domain.Payment) *UpdatePaymentResponse {
	return &UpdatePaymentResponse{
		ID:      payment.ID,
		OrderNo: payment.Order.Type + "" + payment.Order.OrderNo,
		Amount:  payment.Amount,
		Status:  payment.Status,
	}
}

type UpdatePacksProductionIDRequest struct {
	PackID        string `json:"packId" binding:"required" validate:"required"`
	CasingID      string `json:"casingId,omitempty"`
	WireHarnessID string `json:"wireHarnessId,omitempty"`
}

type UpdatePacksProductionResponse struct {
	PackID        uuid.UUID  `json:"packId" binding:"required" validate:"required"`
	CasingID      *uuid.UUID `json:"casingId,omitempty"`
	WireHarnessID *uuid.UUID `json:"wireHarnessId,omitempty"`
}

func NewUpdatePacksProductionResponse(pack *domain.OrderItem) *UpdatePacksProductionResponse {
	return &UpdatePacksProductionResponse{
		PackID:        pack.ID,
		CasingID:      pack.CasingID,
		WireHarnessID: pack.WireHarnessID,
	}
}

type DeletePackIdRequest struct {
	PackID string `uri:"pack-id" binding:"required" json:"pack-id"`
}

type DeletePackResponse struct {
	PackID   uuid.UUID `json:"id"`
	SerialNo string    `json:"serial_no"`
}

func NewDeletePackResponse(pack *domain.OrderItem) DeletePackResponse {
	return DeletePackResponse{
		PackID:   pack.ID,
		SerialNo: pack.SerialNo,
	}
}
