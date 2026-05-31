package dto

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
)

type GetReportRequest struct {
	StartDate time.Time `form:"start_date" binding:"required" time_format:"2006-01-02"`
	EndDate   time.Time `form:"end_date" binding:"required" time_format:"2006-01-02"`
}

type GetInventoryReportResponse struct {
	ID        uuid.UUID `json:"id"`
	ItemCode  string    `json:"item_code"`
	ItemName  string    `json:"item_name"`
	Quantity  int       `json:"quantity"`
	Hold      float64   `json:"hold"`
	Threshold float64   `json:"threshold"`
	Status    string    `json:"status"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
}

func NewGetInventoryReportResponse(inventory *domain.Inventory) *GetInventoryReportResponse {
	return &GetInventoryReportResponse{
		ID:        inventory.ID,
		ItemCode:  inventory.ItemCode,
		ItemName:  inventory.ItemName,
		Quantity:  inventory.QuantityInStock,
		Hold:      inventory.Hold,
		Threshold: inventory.Threshold,
		Status:    inventory.Status,
		CreatedBy: inventory.User.FirstName + " " + inventory.User.LastName,
		CreatedAt: inventory.CreatedAt,
	}
}

type GetProductsReportResponse struct {
	ID          uuid.UUID              `json:"id"`
	ProductName string                 `json:"product_name"`
	Category    domain.ProductCategory `json:"category"`
	Price       float64                `json:"price"`
	Type        string                 `json:"type"`
	Active      bool                   `json:"active"`
	CreatedBy   string                 `json:"created_by"`
	CreatedAt   time.Time              `json:"created_at"`
}

func NewGetProductsReportResponse(product *domain.Product) *GetProductsReportResponse {
	return &GetProductsReportResponse{
		ID:          product.ProductID,
		ProductName: product.Name,
		Category:    product.Category,
		Price:       product.BasePrice,
		Type:        product.Type,
		Active:      *product.IsActive,
		CreatedBy:   product.User.FirstName + " " + product.User.LastName,
		CreatedAt:   product.CreatedAt,
	}
}

type GetQuotesReportResponse struct {
	ID        uuid.UUID `json:"id"`
	QuoteNo   string    `json:"quote_no"`
	Customer  string    `json:"customer"`
	Price     float64   `json:"price"`
	Status    string    `json:"status"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
}

func NewGetQuotesReportResponse(quote *domain.Quote) *GetQuotesReportResponse {
	return &GetQuotesReportResponse{
		ID:        quote.QuoteID,
		QuoteNo:   quote.Type + "-" + quote.QuoteNo,
		Customer:  quote.Customer.FirstName + " " + quote.Customer.LastName,
		Price:     quote.Total,
		Status:    quote.Status,
		CreatedBy: quote.User.FirstName + " " + quote.User.LastName,
		CreatedAt: quote.CreatedAt,
	}
}

type GetOrdersReportResponse struct {
	ID               uuid.UUID `json:"id"`
	OrderNo          string    `json:"order_no"`
	Customer         string    `json:"customer"`
	Price            float64   `json:"price"`
	OrderStatus      string    `json:"order_status"`
	PaymentStatus    string    `json:"payment_status"`
	ExpectedDelivery time.Time `json:"expected_delivery"`
	CreatedBy        string    `json:"created_by"`
	CreatedAt        time.Time `json:"created_at"`
}

func NewGetOrdersReportResponse(order *domain.Order) *GetOrdersReportResponse {
	return &GetOrdersReportResponse{
		ID:               order.OrderID,
		OrderNo:          order.Type + "-" + order.OrderNo,
		Customer:         order.Customer.FirstName + " " + order.Customer.LastName,
		Price:            order.Total,
		OrderStatus:      order.OrderStatus,
		PaymentStatus:    order.PaymentStatus,
		ExpectedDelivery: order.ExpectedDeliveryDate,
		CreatedBy:        order.User.FirstName + " " + order.User.LastName,
		CreatedAt:        order.CreatedAt,
	}
}

type GetSalesReportResponse struct {
	ID          uuid.UUID `json:"id"`
	SaleNo      string    `json:"sale_no"`
	Type        string    `json:"type"`
	Salesperson string    `json:"salesperson"`
	Customer    string    `json:"customer"`
	Commission  float64   `json:"commission"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
}

func NewGetSalesReportResponse(sale *domain.Sale) *GetSalesReportResponse {
	return &GetSalesReportResponse{
		ID:          sale.SalesID,
		SaleNo:      sale.SalesNo,
		Type:        sale.SalesType,
		Salesperson: sale.SalespersonData.FirstName + " " + sale.SalespersonData.LastName,
		Customer:    sale.CustomerName,
		Commission:  *sale.Commission,
		CreatedBy:   sale.User.FirstName + " " + sale.User.LastName,
		CreatedAt:   sale.CreatedAt,
	}
}

type GetRepairsReportResponse struct {
	ID        uuid.UUID `json:"id"`
	RepairNo  string    `json:"repair_no"`
	Customer  string    `json:"customer"`
	Price     float64   `json:"price"`
	Status    string    `json:"status"`
	DueDate   time.Time `json:"due_date"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
}

func NewGetRepairsReportResponse(repair *domain.Repair) *GetRepairsReportResponse {
	return &GetRepairsReportResponse{
		ID:        repair.ID,
		RepairNo:  repair.JobNo,
		Customer:  repair.CustomerName,
		Price:     repair.Price,
		Status:    repair.Status,
		DueDate:   repair.DueDate,
		CreatedBy: repair.User.FirstName + " " + repair.User.LastName,
		CreatedAt: repair.CreatedAt,
	}
}
