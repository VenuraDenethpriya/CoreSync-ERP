package dto

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
)

type GetReportRequest struct {
	StartDate     time.Time `form:"start_date" binding:"required" time_format:"2006-01-02"`
	EndDate       time.Time `form:"end_date" binding:"required" time_format:"2006-01-02"`
	Vat           string    `form:"vat"`
	OrderStatus   string    `form:"order_status"`
	PaymentStatus string    `form:"payment_status"`
	PaymentMode   string    `form:"payment_mode"`
	Salesperson   string    `form:"salesperson"`
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
	Salesperson      string    `json:"salesperson"`
	Customer         string    `json:"customer"`
	Price            float64   `json:"price"`
	OrderStatus      string    `json:"order_status"`
	PaymentStatus    string    `json:"payment_status"`
	VatStatus        bool      `json:"vat_status"`
	PaymentMode      []string  `json:"payment_mode"`
	ExpectedDelivery time.Time `json:"expected_delivery"`
	CreatedBy        string    `json:"created_by"`
	CreatedAt        time.Time `json:"created_at"`
}

func NewGetOrdersReportResponse(order *domain.Order) *GetOrdersReportResponse {
	paymentModes := []string{}

	if order.Payments != nil {
		for _, p := range order.Payments {
			if p.PaymentMode != "" {
				paymentModes = append(paymentModes, p.PaymentMode)
			}
		}
	}

	salespersonName := "N/A"
	if order.Sale != nil && order.Sale.SalespersonData != nil {
		salespersonName = order.Sale.SalespersonData.FirstName + " " + order.Sale.SalespersonData.LastName
	}

	customerName := "N/A"
	if order.Customer != nil {
		customerName = order.Customer.FirstName + " " + order.Customer.LastName
	}

	createdByName := "N/A"
	if order.User != nil {
		createdByName = order.User.FirstName + " " + order.User.LastName
	}

	return &GetOrdersReportResponse{
		ID:               order.OrderID,
		OrderNo:          order.Type + "" + order.OrderNo,
		Salesperson:      salespersonName,
		Customer:         customerName,
		Price:            order.Total,
		OrderStatus:      order.OrderStatus,
		VatStatus:        order.Vat,
		PaymentStatus:    order.PaymentStatus,
		PaymentMode:      paymentModes,
		ExpectedDelivery: order.ExpectedDeliveryDate,
		CreatedBy:        createdByName,
		CreatedAt:        order.CreatedAt,
	}
}

type GetSalesReportResponse struct {
	ID            uuid.UUID `json:"id"`
	SaleNo        string    `json:"sale_no"`
	Type          string    `json:"type"`
	Salesperson   string    `json:"salesperson"`
	Customer      string    `json:"customer"`
	Commission    float64   `json:"commission"`
	Status        string    `json:"status"`
	VatStatus     bool      `json:"vat_status"`
	PaymentStatus string    `json:"payment_status"`
	PaymentMode   []string  `json:"payment_mode"`
	CreatedBy     string    `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
}

//	func NewGetSalesReportResponse(sale *domain.Sale) *GetSalesReportResponse {
//		var paymentModes []string
//		for _, p := range sale.Order.Payments {
//			if p.PaymentMode != "" {
//				paymentModes = append(paymentModes, p.PaymentMode)
//			}
//		}
//		return &GetSalesReportResponse{
//			ID:            sale.SalesID,
//			SaleNo:        sale.SalesNo,
//			Type:          sale.SalesType,
//			Salesperson:   sale.SalespersonData.FirstName + " " + sale.SalespersonData.LastName,
//			Customer:      sale.CustomerName,
//			Status:        sale.Status,
//			VatStatus:     sale.Order.Vat,
//			PaymentStatus: sale.Order.PaymentStatus,
//			PaymentMode:   paymentModes,
//			Commission:    *sale.Commission,
//			CreatedBy:     sale.User.FirstName + " " + sale.User.LastName,
//			CreatedAt:     sale.CreatedAt,
//		}
//	}

func NewGetSalesReportResponse(sale *domain.Sale) *GetSalesReportResponse {
	var paymentModes []string
	var vatStatus bool
	var paymentStatus string

	if sale.Order != nil {
		vatStatus = sale.Order.Vat
		paymentStatus = sale.Order.PaymentStatus

		if sale.Order.Payments != nil {
			for _, p := range sale.Order.Payments {
				if p.PaymentMode != "" {
					paymentModes = append(paymentModes, p.PaymentMode)
				}
			}
		}
	}

	var commissionVal float64
	if sale.Commission != nil {
		commissionVal = *sale.Commission
	}

	salespersonName := "Unknown Salesperson"
	if sale.SalespersonData != nil {
		salespersonName = sale.SalespersonData.FirstName + " " + sale.SalespersonData.LastName
	}

	createdBy := "Unknown User"
	if sale.User != nil {
		createdBy = sale.User.FirstName + " " + sale.User.LastName
	}

	return &GetSalesReportResponse{
		ID:            sale.SalesID,
		SaleNo:        sale.SalesNo,
		Type:          sale.SalesType,
		Salesperson:   salespersonName,
		Customer:      sale.CustomerName,
		Status:        sale.Status,
		VatStatus:     vatStatus,
		PaymentStatus: paymentStatus,
		PaymentMode:   paymentModes,
		Commission:    commissionVal,
		CreatedBy:     createdBy,
		CreatedAt:     sale.CreatedAt,
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

type GetPaymentsReportResponse struct {
	ID          uuid.UUID `json:"id"`
	OrderNo     string    `json:"order_no"`
	Salesperson string    `json:"salesperson"`
	Customer    string    `json:"customer"`
	Price       float64   `json:"price"`
	VatStatus   bool      `json:"vat_status"`
	PaymentMode string    `json:"payment_mode"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   string    `json:"created_at"`
}

// func NewGetPaymentsReportResponse(payment *domain.Payment) *GetPaymentsReportResponse {
// 	salespersonName := "N/A"
// 	if payment.Order.Sale != nil && payment.Order.Sale.User != nil {
// 		salespersonName = payment.Order.Sale.User.FirstName + " " + payment.Order.Sale.User.LastName
// 	}

// 	customerName := "N/A"
// 	if payment.Order.Customer != nil {
// 		customerName = payment.Order.Customer.FirstName + " " + payment.Order.Customer.LastName
// 	}

// 	createdByName := "N/A"
// 	if payment.User != nil {
// 		createdByName = payment.User.FirstName + " " + payment.User.LastName
// 	}

//		return &GetPaymentsReportResponse{
//			ID:          payment.OrderID,
//			OrderNo:     payment.Order.Type + "" + payment.Order.OrderNo,
//			Salesperson: salespersonName,
//			Customer:    customerName,
//			Price:       payment.Amount,
//			VatStatus:   payment.Order.Vat,
//			PaymentMode: payment.PaymentMode,
//			CreatedBy:   createdByName,
//			CreatedAt:   payment.PaidDate,
//		}
//	}

func NewGetPaymentsReportResponse(payment *domain.Payment) *GetPaymentsReportResponse {
	if payment == nil {
		return nil
	}

	salespersonName := "N/A"
	customerName := "N/A"
	createdByName := "N/A"
	orderNo := "N/A"
	var vatStatus bool

	if payment.Order != nil {
		orderNo = payment.Order.Type + "" + payment.Order.OrderNo
		vatStatus = payment.Order.Vat

		if payment.Order.Sale != nil && payment.Order.Sale.SalespersonData != nil {
			salespersonName = payment.Order.Sale.SalespersonData.FirstName + " " + payment.Order.Sale.SalespersonData.LastName
		}

		if payment.Order.Customer != nil {
			customerName = payment.Order.Customer.FirstName + " " + payment.Order.Customer.LastName
		}
	}

	// 4. Safely check payment.User
	if payment.User != nil {
		createdByName = payment.User.FirstName + " " + payment.User.LastName
	}

	return &GetPaymentsReportResponse{
		ID:          payment.OrderID,
		OrderNo:     orderNo,
		Salesperson: salespersonName,
		Customer:    customerName,
		Price:       payment.Amount,
		VatStatus:   vatStatus,
		PaymentMode: payment.PaymentMode,
		CreatedBy:   createdByName,
		CreatedAt:   payment.PaidDate,
	}
}
