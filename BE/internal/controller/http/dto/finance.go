package dto

import (
	"time"

	"github.com/google/uuid"

	"CoreSync-backend/internal/service/domain"
)

type Item struct {
	Name          string  `json:"item_name"`
	Description   string  `json:"description"`
	Quantity      int     `json:"qty"`
	EstimatedCost float64 `json:"estimated_cost"`
	Supplier      string  `json:"supplier"`
	Reason        string  `json:"reason"`
}

type CreatePurchaseOrderRequest struct {
	Items       []Item `json:"items"`
	Department  string `json:"department"`
	Date        string `json:"date"`
	RequestedBy string `json:"requested_by"`
	CreatedBy   string `json:"created_by"`
	Remark      string `json:"remark"`
}

type CreatePurchaseOrderResponse struct {
	ID         uuid.UUID `json:"id"`
	PurchaseNo string    `json:"purchase_no"`
	CreatedBy  string    `json:"created_by"`
}

func NewCreatePurchaseOrderResponse(finance *domain.Finance) *CreatePurchaseOrderResponse {
	return &CreatePurchaseOrderResponse{
		ID:         finance.ID,
		PurchaseNo: finance.PurchaseNo,
		CreatedBy:  finance.CreatedBy,
	}

}

type GetPurchaseOrderRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type GetPurchaseOrderResponse struct {
	ID               uuid.UUID `json:"id"`
	PurchaseNo       string    `json:"purchase_no"`
	Items            []Item    `json:"items"`
	RequestedBy      string    `json:"requested_by"`
	Status           string    `json:"status"`
	MoneyTransaction bool      `json:"money_transaction"`
	Date             string    `json:"date"`
}

type GetPurchaseOrderList struct {
	PurchaseOrders      []GetPurchaseOrderResponse `json:"purchase_orders"`
	Total               int                        `json:"total"`
	TotalPurchaseOrders int                        `json:"total_purchase_orders"`
}

func NewGetPurchaseOrderResponse(purchaseOrders []*domain.Finance, totalPurchaseOrders int) *GetPurchaseOrderList {
	responses := make([]GetPurchaseOrderResponse, 0, len(purchaseOrders))

	for _, po := range purchaseOrders {

		var items []Item
		if po.Items != nil {
			items = make([]Item, 0, len(po.Items))
			for _, item := range po.Items {
				items = append(items, Item{
					Name:          item.Name,
					Description:   item.Description,
					Quantity:      item.Quantity,
					EstimatedCost: item.EstimatedCost,
					Supplier:      item.Supplier,
					Reason:        item.Reason,
				})
			}
		} else {
			items = make([]Item, 0)
		}

		requestedBy := ""
		if po.RequestedBy != "" && po.User != nil {
			requestedBy = po.User.FirstName + " " + po.User.LastName
		}

		response := GetPurchaseOrderResponse{
			ID:               po.ID,
			PurchaseNo:       po.PurchaseNo,
			Items:            items,
			RequestedBy:      requestedBy,
			Status:           po.Status,
			MoneyTransaction: po.IsTransferred,
			Date:             po.Date,
		}

		responses = append(responses, response)
	}

	return &GetPurchaseOrderList{
		PurchaseOrders:      responses,
		Total:               len(responses),
		TotalPurchaseOrders: totalPurchaseOrders,
	}
}

type GetPurchaseOrderIdRequest struct {
	ID string `uri:"purchaseOrderId" json:"purchaseOrderId"`
}

type GetPurchaseOrderIdResponse struct {
	ID               uuid.UUID `json:"id"`
	PurchaseNo       string    `json:"purchase_no"`
	Department       string    `json:"department"`
	Items            []Item    `json:"items"`
	RequestedBy      string    `json:"requested_by"`
	Status           string    `json:"status"`
	MoneyTransaction bool      `json:"money_transaction"`
	Date             string    `json:"date"`
	CreatedBy        string    `json:"created_by"`
	UpdatedBy        string    `json:"Updated_by"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"Updated_at"`
}

func NewGetPurchaseOrderIdResponse(po *domain.Finance) *GetPurchaseOrderIdResponse {
	requestedBy := ""

	if po.RequestedBy != "" && po.User != nil {
		requestedBy = po.User.FirstName + " " + po.User.LastName
	}
	createdBy := po.CreatedBy
	if po.CreatedBy != "" && po.Creator != nil {
		createdBy = po.Creator.FirstName + " " + po.Creator.LastName
	}

	updatedBy := po.UpdatedBy
	if po.UpdatedBy != "" && po.Updater != nil {
		updatedBy = po.Updater.FirstName + " " + po.Updater.LastName
	}
	var items []Item
	if po.Items != nil {
		items = make([]Item, 0, len(po.Items))
		for _, item := range po.Items {
			items = append(items, Item{
				Name:          item.Name,
				Description:   item.Description,
				Quantity:      item.Quantity,
				EstimatedCost: item.EstimatedCost,
				Supplier:      item.Supplier,
				Reason:        item.Reason,
			})
		}
	} else {
		items = make([]Item, 0)
	}

	return &GetPurchaseOrderIdResponse{
		ID:               po.ID,
		PurchaseNo:       po.PurchaseNo,
		Department:       po.Department,
		Items:            items,
		RequestedBy:      requestedBy,
		Status:           po.Status,
		MoneyTransaction: po.IsTransferred,
		Date:             po.Date,
		CreatedBy:        createdBy,
		UpdatedBy:        updatedBy,
		CreatedAt:        po.CreatedAt,
		UpdatedAt:        po.UpdatedAt,
	}
}

type DeletePurchaseOrderRequest struct {
	PurchaseOrderId string `uri:"purchaseOrderId" json:"purchaseOrderId"`
}

type DeletePurchaseOrderResponse struct {
	ID uuid.UUID `json:"id"`
}

func NewDeletePurchaseOrderResponse(site *domain.Finance) *DeletePurchaseOrderResponse {
	return &DeletePurchaseOrderResponse{
		ID: site.ID,
	}
}

type UpdatePurchaseOrderRequest struct {
	ID        uuid.UUID `json:"id" binding:"required"`
	Status    string    `json:"status"`
	Payment   bool      `json:"payment"`
	UpdatedBy string    `json:"updated_by"`
}

type UpdatePurchaseOrderResponse struct {
	ID        uuid.UUID `json:"id" binding:"required"`
	Status    string    `json:"status"`
	Payment   bool      `json:"payment"`
	UpdatedBy string    `json:"updated_by"`
}

func NewUpdatePurchaseOrderResponse(purchaseOrder *domain.Finance) *UpdatePurchaseOrderResponse {
	return &UpdatePurchaseOrderResponse{
		ID:        purchaseOrder.ID,
		Status:    purchaseOrder.Status,
		Payment:   purchaseOrder.IsTransferred,
		UpdatedBy: purchaseOrder.UpdatedBy,
	}
}

type GetItemRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type ItemName struct {
	Name string `json:"item_name"`
}

type GetItemList struct {
	ItemList   []ItemName `json:"items"`
	Total      int        `json:"total"`
	TotalItems int        `json:"total_items"`
}

func NewGetItemsResponse(financeRecords []*domain.Finance, totalPOs int) *GetItemList {
	var extractedItems []ItemName

	for _, po := range financeRecords {

		for _, item := range po.Items {

			if item.Name != "" {
				extractedItems = append(extractedItems, ItemName{
					Name: item.Name,
				})
			}
		}
	}

	if extractedItems == nil {
		extractedItems = make([]ItemName, 0)
	}

	return &GetItemList{
		ItemList:   extractedItems,
		Total:      totalPOs,
		TotalItems: len(extractedItems),
	}
}
