package mapper

import (
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"
)

// QuoteRequestToDomain converts a CreateQuoteRequest to a domain.Quote
func QuoteRequestToDomain(req *dto.CreateQuoteRequest) *domain.Quote {
	var domainAdditionalChargesForQuote []domain.AdditionalChargeForQuote
	for _, ac := range req.AdditionalCharges {

		domainAdditionalChargesForQuote = append(domainAdditionalChargesForQuote, domain.AdditionalChargeForQuote{
			Type:  ac.Type,
			Value: ac.Value,
		})
	}
	var salesUUID uuid.UUID
	if req.SalesID != "" {
		// We use Parse instead of MustParse to prevent crashing on bad input
		parsedID, err := uuid.Parse(req.SalesID)
		if err == nil {
			salesUUID = parsedID
		}
	}
	return &domain.Quote{
		Type:              req.Type,
		QuoteNo:           req.QuoteNo,
		SubTotal:          req.SubTotal,
		AdditionalCharges: domainAdditionalChargesForQuote,
		Discount:          req.Discount,
		Total:             req.Total,
		Vat:               req.Vat,
		IsCatalog:         req.IsCatalog,
		PoNo:              req.PoNo,
		SalesID:           salesUUID,
		CreatedBy:         req.CreatedBy,
	}
}

// QuoteResponseToDomain converts a CreateQuoteResponse to a domain.Quote
func QuoteResponseToDomain(req *dto.CreateQuoteResponse) *domain.Quote {
	var domainAdditionalChargesForQuote []domain.AdditionalChargeForQuote
	for _, ac := range req.AdditionalCharges {
		domainAdditionalChargesForQuote = append(domainAdditionalChargesForQuote, domain.AdditionalChargeForQuote{
			Type:  ac.Type,
			Value: ac.Value,
		})
	}
	return &domain.Quote{
		Type:              req.Type,
		QuoteID:           req.QuoteID,
		CustomerID:        req.CustomerID,
		CreatedBy:         req.CreatedBy,
		QuoteNo:           req.QuoteNo,
		SubTotal:          req.SubTotal,
		AdditionalCharges: domainAdditionalChargesForQuote,
		Discount:          req.Discount,
		Total:             req.Total,
		Vat:               req.Vat,
		IsCatalog:         req.IsCatalog,
		Status:            req.Status,
		PoNo:              req.PoNo,
		SalesID:           req.SalesID,
		CreatedAt:         req.CreatedAt,
		UpdatedAt:         req.UpdatedAt,
	}
}

// QuoteItemsRequestToDomain converts a CreateQuoteItemRequest to a domain.QuoteItem
func QuoteItemsRequestToDomain(req *dto.CreateQuoteItemRequest) []*domain.QuoteItem {
	var items []*domain.QuoteItem
	for _, item := range req.Items {
		items = append(items, &domain.QuoteItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			UnitPrice: item.UnitPrice,
			SubTotal:  item.SubTotal,
			Note:      item.Note,
		})
	}
	return items
}

// QuoteItemResponseToDomain converts a CreateQuoteItemResponse to a domain.QuoteItem
func QuoteItemResponseToDomain(req *dto.CreateQuoteItemResponse) *domain.QuoteItem {
	return &domain.QuoteItem{
		ID:        req.ID,
		QuoteNo:   req.QuoteNo,
		ProductID: req.ProductID,
		Quantity:  req.Quantity,
		UnitPrice: req.UnitPrice,
		SubTotal:  req.SubTotal,
		Note:      req.Note,
		CreatedAt: req.CreatedAt,
	}
}

// QuoteStatusUpdateToDomain converts a UpdateQuoteStatusRequest to a domain.Quote
func QuoteStatusUpdateToDomain(req *dto.UpdateQuoteStatusRequest) *domain.Quote {
	return &domain.Quote{
		QuoteID: uuid.MustParse(req.QuoteID),
		Status:  req.Status,
	}
}

// OrderRequestToDomain converts a CreateOrderRequest to a domain.Order
func UpdateQuoteRequestToDomain(req *dto.UpdateQuoteRequest) *domain.Quote {
	var domainAdditionalChargesForQuote []domain.AdditionalChargeForQuote
	for _, ac := range req.AdditionalCharges {

		domainAdditionalChargesForQuote = append(domainAdditionalChargesForQuote, domain.AdditionalChargeForQuote{
			Type:  ac.Type,
			Value: ac.Value,
		})
	}
	return &domain.Quote{
		QuoteNo:           req.QuoteNo,
		SubTotal:          req.SubTotal,
		AdditionalCharges: domainAdditionalChargesForQuote,
		Discount:          req.Discount,
		Total:             req.Total,
		Vat:               req.Vat,
		PoNo:              req.PoNo,
		SalesID:           req.SalesID,
		IsCatalog:         req.IsCatalog,
		Status:            req.Status,
	}
}

// OrderResponseToDomain converts a CreateOrderResponse to a domain.Order
func UpdateQuoteResponseToDomain(req *dto.UpdateQuoteResponse) *domain.Quote {
	var domainAdditionalChargesForQuote []domain.AdditionalChargeForQuote
	for _, ac := range req.AdditionalCharges {
		domainAdditionalChargesForQuote = append(domainAdditionalChargesForQuote, domain.AdditionalChargeForQuote{
			Type:  ac.Type,
			Value: ac.Value,
		})
	}
	return &domain.Quote{
		QuoteID:           req.QuoteID,
		CustomerID:        req.CustomerID,
		CreatedBy:         req.CreatedBy,
		QuoteNo:           req.QuoteNo,
		SubTotal:          req.SubTotal,
		AdditionalCharges: domainAdditionalChargesForQuote,
		Discount:          req.Discount,
		Total:             req.Total,
		Vat:               req.Vat,
		IsCatalog:         req.IsCatalog,
		Status:            req.Status,
		PoNo:              req.PoNo,
		SalesID:           req.SalesID,
		CreatedAt:         req.CreatedAt,
		UpdatedAt:         req.UpdatedAt,
	}
}

// OrderItemsRequestToDomain converts a CreateOrderItemRequest to a domain.OrderItem
func UpdateQuoteItemsRequestToDomain(req *dto.UpdateQuoteitemIdRequest) []*domain.QuoteItem {
	var items []*domain.QuoteItem
	for _, item := range req.Items {
		quoteItem := &domain.QuoteItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			UnitPrice: item.UnitPrice,
			SubTotal:  item.SubTotal,
			Note:      item.Note,
		}

		if item.ID != nil {
			quoteItem.ID = *item.ID
		}

		items = append(items, quoteItem)
	}
	return items
}

// Orders
// Orders
// OrderRequestToDomain converts a CreateOrderRequest to a domain.Order
func OrderRequestToDomain(req *dto.CreateOrderRequest) *domain.Order {
	var domainAdditionalCharges []domain.AdditionalCharge
	for _, ac := range req.AdditionalCharges {
		domainAdditionalCharges = append(domainAdditionalCharges, domain.AdditionalCharge{
			Type:  ac.Type,
			Value: ac.Value,
		})
	}
	var salesUUID uuid.UUID
	if req.SalesID != "" {
		// We use Parse instead of MustParse to prevent crashing on bad input
		parsedID, err := uuid.Parse(req.SalesID)
		if err == nil {
			salesUUID = parsedID
		}
	}
	return &domain.Order{
		Type:                 req.Type,
		OrderNo:              req.OrderNo,
		SubTotal:             req.SubTotal,
		AdditionalCharges:    domainAdditionalCharges,
		Discount:             req.Discount,
		Total:                req.Total,
		Vat:                  req.Vat,
		PaymentStatus:        req.PaymentStatus,
		ExpectedDeliveryDate: req.ExpectedDeliveryDate,
		PoNo:                 req.PoNo,
		SalesID:              salesUUID,
		CreatedBy:            req.CreatedBy,
	}
}

// OrderResponseToDomain converts a CreateOrderResponse to a domain.Order
func OrderResponseToDomain(req *dto.CreateOrderResponse) *domain.Order {
	var domainAdditionalCharges []domain.AdditionalCharge
	for _, ac := range req.AdditionalCharges {
		domainAdditionalCharges = append(domainAdditionalCharges, domain.AdditionalCharge{
			Type:  ac.Type,
			Value: ac.Value,
		})
	}
	return &domain.Order{
		Type:                 req.Type,
		OrderID:              req.OrderID,
		CustomerID:           req.CustomerID,
		CreatedBy:            req.CreatedBy,
		OrderNo:              req.OrderNo,
		SubTotal:             req.SubTotal,
		AdditionalCharges:    domainAdditionalCharges,
		Discount:             req.Discount,
		Total:                req.Total,
		Vat:                  req.Vat,
		OrderStatus:          req.OrderStatus,
		PaymentStatus:        req.PaymentStatus,
		ExpectedDeliveryDate: req.ExpectedDeliveryDate,
		PoNo:                 req.PoNo,
		SalesID:              req.SalesID,
		CreatedAt:            req.CreatedAt,
		UpdatedAt:            req.UpdatedAt,
	}
}

// OrderItemsRequestToDomain converts a CreateOrderItemRequest to a domain.OrderItem
func OrderItemsRequestToDomain(req *dto.CreateOrderItemRequest) []*domain.OrderItem {
	var items []*domain.OrderItem
	for _, item := range req.Items {
		items = append(items, &domain.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			UnitPrice: item.UnitPrice,
			SubTotal:  item.SubTotal,
			Note:      item.Note,
		})
	}
	return items
}

// OrderItemResponseToDomain converts a CreateOrderItemResponse to a domain.OrderItem
func OrderItemResponseToDomain(req *dto.CreateOrderItemResponse) *domain.OrderItem {
	return &domain.OrderItem{
		ID:        req.ID,
		OrderNo:   req.OrderNo,
		ProductID: req.ProductID,
		Quantity:  req.Quantity,
		UnitPrice: req.UnitPrice,
		SubTotal:  req.SubTotal,
		Note:      req.Note,
		CreatedAt: req.CreatedAt,
	}
}
func convertCADFileToDomain(dtoCAD dto.CADFile) domain.CADFile {
	return domain.CADFile{
		FileName: dtoCAD.FileName,
		Email:    dtoCAD.Email,
		Quantity: dtoCAD.Quantity,
	}
}

func convertDesignerToDomain(dtoDesigner dto.Designer) domain.Designer {
	return domain.Designer{
		Email:       dtoDesigner.Email,
		Description: dtoDesigner.Description,
	}
}

func UpdateOrderRequestToDomain(req *dto.UpdateOrderRequest) *domain.Order {
	var domainAdditionalCharges []domain.AdditionalCharge
	for _, ac := range req.AdditionalCharges {
		domainAdditionalCharges = append(domainAdditionalCharges, domain.AdditionalCharge{
			Type:  ac.Type,
			Value: ac.Value,
		})
	}
	return &domain.Order{
		OrderNo:           req.OrderNo,
		SubTotal:          req.SubTotal,
		AdditionalCharges: domainAdditionalCharges,
		Discount:          req.Discount,
		Total:             req.Total,
		Vat:               req.Vat,
		OrderStatus:       req.OrderStatus,
		PaymentStatus:     req.PaymentStatus,
		PoNo:              req.PoNo,
		SalesID:           req.SalesID,
		// CreatedBy: req.CreatedBy,
	}
}
func ApproveOrderRequestToDomain(req *dto.ApproveOrderRequest) *domain.Order {
	return &domain.Order{
		Assignee:   req.Assignee,
		Supervisor: req.Supervisor,
		CADFiles:   convertCADFileToDomain(req.CADFile),
		Designer:   convertDesignerToDomain(req.Designer),
	}
}

func UpdateOrderResponseToDomain(req *dto.UpdateOrderResponse) *domain.Order {
	var domainAdditionalCharges []domain.AdditionalCharge
	for _, ac := range req.AdditionalCharges {
		domainAdditionalCharges = append(domainAdditionalCharges, domain.AdditionalCharge{
			Type:  ac.Type,
			Value: ac.Value,
		})
	}
	return &domain.Order{
		OrderNo:           req.OrderNo,
		SubTotal:          req.SubTotal,
		AdditionalCharges: domainAdditionalCharges,
		Total:             req.Total,
		Vat:               req.Vat,
		OrderStatus:       req.OrderStatus,
		PaymentStatus:     req.PaymentStatus,
		PoNo:              req.PoNo,
		SalesID:           req.SalesID,
		CreatedBy:         req.CreatedBy,
	}
}
func ApproveOrderResponseToDomain(req *dto.ApproveOrderResponse) *domain.Order {
	return &domain.Order{
		Assignee:   req.Assignee,
		Supervisor: req.Supervisor,
		CADFiles:   convertCADFileToDomain(req.CADFiles),
		Designer:   convertDesignerToDomain(req.Designer),
	}
}

func UpdateOrderItemsRequestToDomain(req *dto.UpdateOrderItemRequest) []*domain.OrderItem {
	var items []*domain.OrderItem
	for _, item := range req.Items {
		domainItem := &domain.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			UnitPrice: item.UnitPrice,
			SubTotal:  item.SubTotal,
			Note:      item.Note,
		}

		if item.ID != nil {
			domainItem.ID = *item.ID
		} else {
			domainItem.ID = uuid.Nil
		}

		items = append(items, domainItem)
	}
	return items
}

func UpdateOrderItemResponseToDomain(req *dto.UpdateOrderItemResponse) *domain.OrderItem {
	return &domain.OrderItem{
		ID:        req.ID,
		OrderNo:   req.OrderNo,
		ProductID: req.ProductID,
		Quantity:  req.Quantity,
		UnitPrice: req.UnitPrice,
		SubTotal:  req.SubTotal,
		Note:      req.Note,
		CreatedAt: req.CreatedAt,
	}
}

// OrderStatusUpdateToDomain converts a UpdateQuoteStatusRequest to a domain.Quote
func UpdateOrderStatusUpdateToDomain(req *dto.UpdateOrderStatusRequest) *domain.Order {
	return &domain.Order{
		OrderID:       uuid.MustParse(req.OrderID),
		PaymentStatus: req.PaymentStatus,
		OrderStatus:   req.OrderStatus,
	}
}
func OrderPaymentsRequestToDomain(req *dto.CreateOrderPaymentRequest) *domain.Payment {
	return &domain.Payment{
		PaymentType: req.PaymentType,
		Amount:      req.Amount,
		LoanAmount:  req.LoanAmount,
		PaidDate:    req.PaidDate,
		Image:       req.Image,
		CreatedBy:   req.CreatedBy,
	}
}

func UpdateOrderPaymentsRequestToDomain(req *dto.UpdateOrderPaymentRequest) *domain.Payment {
	return &domain.Payment{
		PaymentType: req.PaymentType,
		Amount:      req.Amount,
		LoanAmount:  req.LoanAmount,
		PaidDate:    req.PaidDate,
		Image:       req.Image,
		CreatedBy:   req.CreatedBy,
	}
}

func UpdateOrderPaymentRefundRequestOrderToDomain(req *dto.UpdateOrderPaymentRefundRequest) *domain.Order {
	return &domain.Order{
		OrderID:       req.OrderID,
		OrderStatus:   req.OrderStatus,
		PaymentStatus: req.PaymentStatus,
	}
}

func UpdateOrderPaymentRefundRequestPaymentsToDomain(req *dto.UpdateOrderPaymentRefundRequest) []*domain.Payment {
	payments := make([]*domain.Payment, 0, len(req.PaymentID))

	for _, pid := range req.PaymentID {
		payments = append(payments, &domain.Payment{
			ID:          pid,
			PaymentType: req.PaymentType,
		})
	}

	return payments
}
