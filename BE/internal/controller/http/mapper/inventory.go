package mapper

import (
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/service/domain"

	"github.com/google/uuid"
)

func InventoryRequestToDomain(req *dto.CreateInventoryRequest) *domain.Inventory {
	return &domain.Inventory{
		ItemCode: req.ItemCode,
		ItemName: req.ItemName,
		// QuantityInStock: req.QuantityInStock,
		UnitCost:  req.UnitCost,
		Threshold: req.Threshold,
		Status:    req.Status,
		CreatedBy: req.CreatedBy,
	}
}

func InventoryResponseToDomain(req *dto.CreateInventoryResponse) *domain.Inventory {
	return &domain.Inventory{
		ItemCode:        req.ItemCode,
		ItemName:        req.ItemName,
		QuantityInStock: req.QuantityInStock,
		UnitCost:        req.UnitCost,
		Threshold:       req.Threshold,
		Status:          req.Status,
		CreatedBy:       req.CreatedBy,
	}
}
func UpdateInventoryRequestToDomain(req *dto.UpdateInventoryRequest) *domain.Inventory {
	return &domain.Inventory{
		ID:              uuid.MustParse(req.ItemID),
		ItemCode:        req.ItemCode,
		ItemName:        req.ItemName,
		QuantityInStock: req.QuantityInStock,
		UnitCost:        req.UnitCost,
		Threshold:       req.Threshold,
		Status:          req.Status,
		ProductID:       req.ProductId,
	}
}
func UpdateInventoryResponseToDomain(req *dto.UpdateInventoryResponse) *domain.Inventory {
	return &domain.Inventory{
		ItemCode:        req.ItemCode,
		ItemName:        req.ItemName,
		QuantityInStock: req.QuantityInStock,
		UnitCost:        req.UnitCost,
		Threshold:       req.Threshold,
		Status:          req.Status,
		CreatedAt:       req.CreatedAt,
		UpdatedAt:       req.UpdatedAt,
		ProductID:       req.ProductID,
	}
}

// func UpdateInventoryRequestToDomain(req *dto.UpdateInventoryRequest) *domain.Inventory {
// 	return &domain.Inventory{
// 		ItemCode:        req.ItemCode,
// 		ItemName:        req.ItemName,
// 		QuantityInStock: req.QuantityInStock,
// 		UnitCost:        req.UnitCost,
// 		Threshold:       req.Threshold,
// 		Status:          req.Status,
// 		ProductID:       req.ProductId,
// 	}
// }
// func UpdateInventoryResponseToDomain(req *dto.UpdateInventoryResponse) *domain.Inventory {
// 	return &domain.Inventory{
// 		ItemCode:        req.ItemCode,
// 		ItemName:        req.ItemName,
// 		QuantityInStock: req.QuantityInStock,
// 		UnitCost:        req.UnitCost,
// 		Threshold:       req.Threshold,
// 		Status:          req.Status,
// 		ProductID:       req.ProductID,
// 		CreatedAt:       req.CreatedAt,
// 		UpdatedAt:       req.UpdatedAt,
// 	}
// }

func InventoryItemUsageRequestToDomain(req *dto.CreateInventoryItemUsageRequest) *domain.InventoryItemUsage {
	var orderID uuid.UUID
	if req.OrderID != nil {
		orderID = *req.OrderID
	}

	var packID uuid.UUID
	if req.PackID != nil {
		packID = *req.PackID
	}
	return &domain.InventoryItemUsage{
		ItemID:  req.ItemID,
		OrderID: orderID,
		PackID:  packID,
		// UsageCount: req.UsageCount,
		UserName: req.UserName,
	}
}
func InventoryItemUsageResponseToDomain(req *dto.CreateInventoryItemUsageResponse) *domain.InventoryItemUsage {
	var orderID uuid.UUID
	if req.OrderID != nil {
		orderID = *req.OrderID
	}

	var packID uuid.UUID
	if req.PackID != nil {
		packID = *req.PackID
	}
	return &domain.InventoryItemUsage{
		ID:      req.ID,
		ItemID:  req.ItemID,
		OrderID: orderID,
		PackID:  packID,
		// UsageCount: req.UsageCount,
		UserName:  req.UserName,
		CreatedAt: req.CreatedAt,
	}
}
func InventoryItemRestockRequestToDomain(req *dto.CreateInventoryItemRestockRequst) *domain.InventoryItemRestock {
	return &domain.InventoryItemRestock{
		ItemID:    req.ItemID,
		UnitPrice: req.UnitPrice,
		Quantity:  req.Quantity,
		Amount:    req.Amount,
		UserName:  req.UserName,
		Remark:    req.Remark,
	}
}

func InventoryItemRestockResponseToDomain(req *dto.CreateInventoryItemRestockResponse) *domain.InventoryItemRestock {
	return &domain.InventoryItemRestock{
		ID:        req.ID,
		ItemID:    req.ItemID,
		Amount:    req.Amount,
		Quantity:  req.Quantity,
		UnitPrice: req.UnitPrice,
		UserName:  req.UserName,
		Remark:    req.Remark,
		CreatedAt: req.CreatedAt,
	}
}
func UpdateInventoryItemRestockRequestToDomain(req *dto.UpdateInventoryItemRestockRequest) *domain.InventoryItemRestock {
	return &domain.InventoryItemRestock{
		ID:      uuid.MustParse(req.ID),
		IsPrint: req.IsPrint,
	}
}

func UpdateInventoryItemRestockResponseToDomain(req *dto.UpdateInventoryItemRestockResponse) *domain.InventoryItemRestock {
	return &domain.InventoryItemRestock{
		ID:      req.ID,
		IsPrint: req.IsPrint,
	}
}

func InventoryItemAllocationRequestToDomain(
	req *dto.CreateInventoryItemAllocationRequest,
	orderID uuid.UUID,
	packID uuid.UUID,
	allocator string,
) *domain.InventoryItemAllocate {
	return &domain.InventoryItemAllocate{
		ItemID:    req.ItemID,
		OrderID:   orderID,
		PackID:    packID,
		Count:     req.Count,
		Allocator: allocator,
	}
}

func InventoryItemAllocationResponseToDomain(req *dto.CreateInventoryItemAllocateResponse) *domain.InventoryItemAllocate {
	var orderID uuid.UUID
	if req.OrderID != nil {
		orderID = *req.OrderID
	}

	var packID uuid.UUID
	if req.PackID != nil {
		packID = *req.PackID
	}
	return &domain.InventoryItemAllocate{
		ID:        req.ID,
		ItemID:    req.ItemID,
		OrderID:   orderID,
		PackID:    packID,
		Count:     req.Count,
		Allocator: req.Allocator,
		CreatedAt: req.CreatedAt,
	}
}

func InventoryOrderRequestToDomain(req *dto.CreateInventoryOrderRequest) *domain.InventoryOrder {
	return &domain.InventoryOrder{
		ItemCode:      req.ItemCode,
		ItemName:      req.ItemName,
		OrderQuantity: req.OrderQuantity,
		Amount:        req.Amount,
		OrderDate:     req.OrderDate,
		CreatedBy:     req.CreatedBy,
	}
}

func UpdateInventoryOrderRequestToDomain(req *dto.UpdateInventoryOrderRequest) *domain.InventoryOrder {
	return &domain.InventoryOrder{
		ID:            uuid.MustParse(req.ID),
		ItemCode:      req.ItemCode,
		ItemName:      req.ItemName,
		OrderQuantity: req.OrderQuantity,
		Quantity:      req.Quantity,
		Amount:        req.Amount,
		Status:        req.Status,
		OrderDate:     req.OrderDate,
	}
}
func UpdateInventoryOrderResponseToDomain(req *dto.UpdateInventoryOrderResponse) *domain.InventoryOrder {
	return &domain.InventoryOrder{
		ID:      req.ID,
		OrderNo: req.OrderNo,
	}
}
