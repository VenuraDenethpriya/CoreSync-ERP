package mapper

import (
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/service/domain"
)

func PurchaseOrderRequestToDomain(req *dto.CreatePurchaseOrderRequest) *domain.Finance {
	var items []domain.Item
	for _, ac := range req.Items {
		items = append(items, domain.Item{
			Name:          ac.Name,
			Description:   ac.Description,
			Quantity:      ac.Quantity,
			EstimatedCost: ac.EstimatedCost,
			Supplier:      ac.Supplier,
			Reason:        ac.Reason,
		})
	}
	return &domain.Finance{
		Department:  req.Department,
		Date:        req.Date,
		Items:       items,
		RequestedBy: req.RequestedBy,
		CreatedBy:   req.CreatedBy,
		Remark:      req.Remark,
	}
}
func PurchaseOrderResponseToDomain(req *dto.CreatePurchaseOrderResponse) *domain.Finance {
	return &domain.Finance{
		ID:         req.ID,
		PurchaseNo: req.PurchaseNo,
		CreatedBy:  req.CreatedBy,
	}
}

func UpdatePurchaseOrderRequestToDomain(req *dto.UpdatePurchaseOrderRequest) *domain.Finance {
	return &domain.Finance{
		ID:            req.ID,
		Status:        req.Status,
		IsTransferred: req.Payment,
		UpdatedBy:     req.UpdatedBy,
	}
}
