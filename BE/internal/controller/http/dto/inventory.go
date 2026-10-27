package dto

import (
	"time"

	"github.com/google/uuid"

	"CoreSync-backend/internal/service/domain"
)

// CreateInventoryRequest represents the request body for creating a new inventory
type CreateInventoryRequest struct {
	ItemCode string `json:"item_code" binding:"required"`
	ItemName string `json:"item_name" binding:"required"`
	// QuantityInStock int     `json:"quantity_in_stock" binding:"required"`
	UnitCost  float64 `json:"unit_cost" binding:"required"`
	Threshold float64 `json:"threshold"`
	Status    string  `json:"status"`
	CreatedBy string  `json:"created_by" binding:"required"`
}

// CreateInventoryResponse represents the response body for creating a new inventory
type CreateInventoryResponse struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	ItemCode        string    `gorm:"type:varchar(100);not null" json:"item_code"`
	ItemName        string    `gorm:"type:varchar(100);not null" json:"item_name"`
	QuantityInStock int       `gorm:"type:int;not null" json:"quantity_in_stock"`
	UnitCost        float64   `gorm:"type:decimal(10,2);not null" json:"unit_cost"`
	Threshold       float64   `gorm:"type:decimal(10,2);not null" json:"threshold"`
	Status          string    `gorm:"type:varchar(100);not null" json:"status"`
	CreatedBy       string    `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"created_by"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// NewCreateInventoryResponse creates a new CreateInventoryResponse instance from a domain.Inventory
func NewCreateInventoryResponse(inventory *domain.Inventory) *CreateInventoryResponse {
	return &CreateInventoryResponse{
		ID:              inventory.ID,
		ItemCode:        inventory.ItemCode,
		ItemName:        inventory.ItemName,
		QuantityInStock: inventory.QuantityInStock,
		UnitCost:        inventory.UnitCost,
		Threshold:       inventory.Threshold,
		Status:          inventory.Status,
		CreatedBy:       inventory.CreatedBy,
		CreatedAt:       inventory.CreatedAt,
		UpdatedAt:       inventory.UpdatedAt,
	}
}

type GetInventoryRequest struct {
	Query    string `form:"query"`
	Limit    int    `form:"limit"`
	Offset   int    `form:"offset"`
	Sellable *bool  `form:"sellable"`
}

// GetInventoryResponse represents the response body for getting an inventory
type GetInventoryResponse struct {
	ID              uuid.UUID `json:"id"`
	ItemCode        string    `json:"item_code"`
	ItemName        string    `json:"item_name"`
	QuantityInStock int       `json:"quantity_in_stock"`
	UnitCost        float64   `json:"unit_cost"`
	// Allocated       int       `json:"allocated"`
	Hold      float64 `json:"hold"`
	Threshold float64 `json:"threshold"`
	Status    string  `json:"status"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}

// Response wrapper for multiple inventory items
type GetAllInventoryResponse struct {
	Items          []GetInventoryResponse `json:"items"`
	Total          int                    `json:"total"`
	TotalInventory int                    `json:"total_inventory"`
}

func NewGetInventoryResponse(inventory *domain.Inventory) *GetInventoryResponse {
	// allocated := 0
	// if inventory.InventoryItemAllocate != nil {
	// 	allocated = inventory.InventoryItemAllocate.Count
	// }

	return &GetInventoryResponse{
		ID:              inventory.ID,
		ItemCode:        inventory.ItemCode,
		ItemName:        inventory.ItemName,
		QuantityInStock: inventory.QuantityInStock,
		// Hold:            inventory.Hold,
		Hold:      float64(inventory.Allocated),
		UnitCost:  inventory.UnitCost,
		Threshold: inventory.Threshold,
		Status:    inventory.Status,
		// Allocated:       inventory.Allocated,
		CreatedAt: inventory.CreatedAt.String(),
		UpdatedAt: inventory.UpdatedAt.String(),
	}
}

// GetAllInventoryResponse represents the response body for getting all inventories
func NewGetAllInventoryResponse(inventories []*domain.Inventory, totalInventory int) *GetAllInventoryResponse {
	items := make([]GetInventoryResponse, len(inventories))
	for i, inventory := range inventories {
		items[i] = *NewGetInventoryResponse(inventory)
	}
	return &GetAllInventoryResponse{
		Items:          items,
		TotalInventory: totalInventory,
		Total:          len(items),
	}
}

// UpdateInventoryRequest represents the request body for updating an inventory
type UpdateInventoryRequest struct {
	ItemID          string    `uri:"item-id" binding:"required" json:"item_id"`
	ItemCode        string    `json:"item_code,omitempty"`
	ItemName        string    `json:"item_name,omitempty"`
	QuantityInStock int       `json:"quantity_in_stock,omitempty"`
	UnitCost        float64   `json:"unit_cost,omitempty"`
	Threshold       float64   `json:"threshold,omitempty"`
	Status          string    `json:"status,omitempty"`
	ProductId       uuid.UUID `json:"product_id,omitempty"`
}

// UpdateInventoryResponse represents the response body for updating an inventory
type UpdateInventoryResponse struct {
	ItemID          uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	ItemCode        string    `gorm:"type:varchar(100);not null" json:"item_code"`
	ItemName        string    `gorm:"type:varchar(100);not null" json:"item_name"`
	QuantityInStock int       `gorm:"type:int;not null" json:"quantity_in_stock"`
	UnitCost        float64   `gorm:"type:decimal(10,2);not null" json:"unit_cost"`
	Threshold       float64   `gorm:"type:decimal(10,2);not null" json:"threshold"`
	Status          string    `gorm:"type:varchar(100);not null" json:"status"`
	ProductID       uuid.UUID `gorm:"type:uuid;foreignKey:ProductID;references:ProductID" json:"product_id"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// NewUpdateInventoryResponse creates a new UpdateInventoryResponse instance from a domain.Inventory
func NewUpdateInventoryResponse(inventory *domain.Inventory) *UpdateInventoryResponse {
	return &UpdateInventoryResponse{
		ItemID:          inventory.ID,
		ItemCode:        inventory.ItemCode,
		ItemName:        inventory.ItemName,
		QuantityInStock: inventory.QuantityInStock,
		UnitCost:        inventory.UnitCost,
		Threshold:       inventory.Threshold,
		Status:          inventory.Status,
		ProductID:       inventory.ProductID,
		CreatedAt:       inventory.CreatedAt,
		UpdatedAt:       inventory.UpdatedAt,
	}
}

// DeleteInventoryIdRequest represents the request uri for deleting an inventory
type DeleteInventoryIdRequest struct {
	ItemID string `uri:"item-id" binding:"required" json:"item_id"`
}

// DeleteInventoryResponse represents the response body for deleting an inventory
type DeleteInventoryResponse struct {
	ItemID uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
}

// NewDeleteInventoryResponse creates a new DeleteInventoryResponse instance from a domain.Inventory
func NewDeleteInventoryResponse(inventory *domain.Inventory) DeleteInventoryResponse {
	return DeleteInventoryResponse{
		ItemID: inventory.ID,
	}
}

type GetInventoryByIdRequest struct {
	ItemID string `uri:"item-id" binding:"required" json:"itemId"`
}

type GetInventoryByIdResponse struct {
	ItemID    uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	ItemCode  string    `gorm:"type:varchar(100);not null" json:"item_code"`
	ItemName  string    `gorm:"type:varchar(100);not null" json:"item_name"`
	Quantity  int       `gorm:"type:int;not null" json:"quantity"`
	UnitCost  float64   `gorm:"type:decimal(10,2);not null" json:"unit_cost"`
	Threshold float64   `gorm:"type:decimal(10,2);not null" json:"threshold"`
	Status    string    `gorm:"type:varchar(100);not null" json:"status"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// NewGetInventoryByIdResponse creates a new GetInventoryByIdResponse instance from a domain.Inventory
func NewGetInventoryByIdResponse(inventory *domain.Inventory) *GetInventoryByIdResponse {
	return &GetInventoryByIdResponse{
		ItemID:    inventory.ID,
		ItemCode:  inventory.ItemCode,
		ItemName:  inventory.ItemName,
		Quantity:  inventory.QuantityInStock,
		UnitCost:  inventory.UnitCost,
		Threshold: inventory.Threshold,
		Status:    inventory.Status,
		CreatedAt: inventory.CreatedAt,
		UpdatedAt: inventory.UpdatedAt,
	}
}

type CreateInventoryItemUsageRequest struct {
	ItemID  uuid.UUID  `binding:"required" json:"item_id"`
	OrderID *uuid.UUID `json:"order_id"`
	PackID  *uuid.UUID `json:"pack_id"`
	// UsageCount int       `binding:"required" json:"usage_count"`
	UserName string `binding:"required" json:"user_name"`
}

type CreateInventoryItemUsageListRequest struct {
	Usages []CreateInventoryItemUsageRequest `json:"usages"`
}

type CreateInventoryItemUsageResponse struct {
	ID       uuid.UUID  `json:"id"`
	ItemID   uuid.UUID  `json:"item_id"`
	ItemCode string     `json:"item_code"`
	OrderID  *uuid.UUID `json:"order_id"`
	PackID   *uuid.UUID `json:"pack_id"`
	// UsageCount int       `gorm:"type:int;not null" json:"usage_count"`
	UserName  string    `json:"user_name"`
	CreatedAt time.Time `json:"created_at"`
}

func NewGetCreateInventoryItemUsageResponse(inventoryItemUsage *domain.InventoryItemUsage) *CreateInventoryItemUsageResponse {
	var orderIDPtr *uuid.UUID
	if inventoryItemUsage.OrderID != uuid.Nil {
		val := inventoryItemUsage.OrderID
		orderIDPtr = &val
	}

	var packIDPtr *uuid.UUID
	if inventoryItemUsage.PackID != uuid.Nil {
		val := inventoryItemUsage.PackID
		packIDPtr = &val
	}
	return &CreateInventoryItemUsageResponse{
		ID:       inventoryItemUsage.ID,
		ItemID:   inventoryItemUsage.ItemID,
		ItemCode: inventoryItemUsage.ItemCode,
		OrderID:  orderIDPtr,
		PackID:   packIDPtr,
		// UsageCount: inventoryItemUsage.UsageCount,
		UserName:  inventoryItemUsage.UserName,
		CreatedAt: inventoryItemUsage.CreatedAt,
	}
}

//	type GetInventoryItemUsageRequest struct {
//		OrderID string `uri:"order-id" binding:"required" json:"order_id"`
//	}
type GetInventoryItemUsageQuery struct {
	OrderID string `form:"order_id"`
	PackID  string `form:"pack_id"`
	ItemID  string `form:"item_id"`
	Limit   int    `form:"limit"`
	Offset  int    `form:"offset"`
}

type GetInventoryItemUsageResponse struct {
	ID            uuid.UUID `json:"id"`
	InventoryID   uuid.UUID `json:"inventory_id"`
	InventoryCode string    `json:"inventory_code"`
	InventoryName string    `json:"inventory_name"`
	ItemID        uuid.UUID `json:"item_id"`
	ItemCode      string    `json:"item_code"`
	OrderID       uuid.UUID `json:"order_id"`
	OrderType     string    `json:"order_type"`
	OrederNo      string    `json:"order_no"`
	PackID        uuid.UUID `json:"pack_id"`
	SerialNo      string    `json:"serial_no"`
	// UsageCount    int       `json:"usage_count"`
	UserName  string    `json:"user_name"`
	CreatedAt time.Time `json:"created_at"`
}

type GetInventoryItemUsageListResponse struct {
	Items []GetInventoryItemUsageResponse `json:"items"`
	Total int                             `json:"total"`
}

func NewGetInventoryItemUsageResponse(usage *domain.InventoryItemUsage) *GetInventoryItemUsageResponse {
	// Name construction
	userName := usage.UserName
	if usage.User != nil {
		userName = usage.User.FirstName + " " + usage.User.LastName
	}

	return &GetInventoryItemUsageResponse{
		ID:            usage.ID,
		InventoryID:   usage.InventoryID,
		InventoryCode: usage.InventoryCode,
		InventoryName: usage.InventoryName,
		// InventoryID:   usage.InventoryItem.ItemID,
		// InventoryCode: usage.InventoryItem.ItemCode,
		// InventoryName: usage.InventoryItem.ItemName,
		ItemID:    usage.ItemID,
		ItemCode:  usage.ItemCode,
		OrderID:   usage.OrderID,
		OrderType: usage.OrderType,
		OrederNo:  usage.OrederNo,
		PackID:    usage.PackID,
		SerialNo:  usage.SerialNo,
		// UsageCount: usage.UsageCount,
		UserName:  userName,
		CreatedAt: usage.CreatedAt,
	}
}

func NewGetInventoryItemUsageListResponse(usages []*domain.InventoryItemUsage, total int) *GetInventoryItemUsageListResponse {
	items := make([]GetInventoryItemUsageResponse, len(usages))
	for i, usage := range usages {
		items[i] = *NewGetInventoryItemUsageResponse(usage)
	}
	return &GetInventoryItemUsageListResponse{
		Items: items,
		Total: total,
	}
}

type UsageItemDetail struct {
	UsageID   uuid.UUID `json:"usage_id"`
	ItemID    uuid.UUID `json:"item_id"`
	ItemCode  string    `json:"item_code"`
	CreatedAt time.Time `json:"created_at"`
}

type GroupedUsageResponse struct {
	ID uuid.UUID `json:"id"`

	OrderID   *uuid.UUID `json:"order_id,omitempty"`
	OrderType string     `json:"order_type,omitempty"`
	OrderNo   string     `json:"order_no,omitempty"`

	PackID   *uuid.UUID `json:"pack_id,omitempty"`
	SerialNo string     `json:"serial_no,omitempty"`

	UserName string `json:"user_name,omitempty"`

	InventoryID   *uuid.UUID `json:"inventory_id,omitempty"`
	InventoryCode string     `json:"inventory_code,omitempty"`
	InventoryName string     `json:"inventory_name,omitempty"`

	TotalUsage int `json:"total_usage"`

	Items []UsageItemDetail `json:"items"`
}

type GetInventoryItemUsageGroupedListResponse struct {
	Items []GroupedUsageResponse `json:"items"`
	Total int                    `json:"total"`
}

func NewGetInventoryItemUsageGroupedListResponse(
	usages []*domain.InventoryItemUsage,
	total int,
	mode string,
) *GetInventoryItemUsageGroupedListResponse {

	groups := make(map[uuid.UUID]*GroupedUsageResponse)
	order := make([]uuid.UUID, 0)

	for _, u := range usages {
		var key uuid.UUID

		if mode == "order" {
			if u.PackID != uuid.Nil {
				key = u.PackID
			} else if u.OrderID != uuid.Nil {
				key = u.OrderID
			} else {
				key = u.ID
			}
		} else if mode == "pack" {
			key = u.InventoryID
		} else {
			key = u.InventoryID
		}

		if key == uuid.Nil {
			// Handle nil UUIDs if necessary
		}

		if _, exists := groups[key]; !exists {
			g := &GroupedUsageResponse{
				ID:         key,
				Items:      []UsageItemDetail{},
				TotalUsage: 0,
			}

			if mode == "order" {
				if u.OrderID != uuid.Nil {
					g.OrderID = &u.OrderID
					g.OrderNo = u.OrederNo
					g.OrderType = u.OrderType
				}

				if u.PackID != uuid.Nil {
					g.PackID = &u.PackID
					g.SerialNo = u.SerialNo
				}

				g.InventoryID = &u.InventoryID
				g.InventoryCode = u.InventoryCode
				g.InventoryName = u.InventoryName

				if u.User != nil {
					g.UserName = u.User.FirstName + " " + u.User.LastName
				} else {
					g.UserName = u.UserName
				}
			} else {
				g.InventoryID = &u.InventoryID
				g.InventoryCode = u.InventoryCode
				g.InventoryName = u.InventoryName
				if u.User != nil {
					g.UserName = u.User.FirstName + " " + u.User.LastName
				} else {
					g.UserName = u.UserName
				}
			}

			groups[key] = g
			order = append(order, key)
		}

		groups[key].Items = append(groups[key].Items, UsageItemDetail{
			UsageID:   u.ID,
			ItemID:    u.ItemID,
			ItemCode:  u.ItemCode,
			CreatedAt: u.CreatedAt,
		})

		groups[key].TotalUsage++
	}

	result := make([]GroupedUsageResponse, 0, len(order))
	for _, id := range order {
		result = append(result, *groups[id])
	}

	return &GetInventoryItemUsageGroupedListResponse{
		Items: result,
		Total: total,
	}
}

type DeleteInventoryItemUsageRequest struct {
	ID         string `binding:"required" json:"id"`
	ItemID     string `binding:"required" json:"item_id"`
	UsageCount int    `binding:"required" json:"usage_count"`
}

type DeleteInventoryItemUsageResponse struct {
	ID uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
}

func NewDeleteInventoryItemUsageResponse(usage *domain.InventoryItemUsage) DeleteInventoryItemUsageResponse {
	return DeleteInventoryItemUsageResponse{
		ID: usage.ID,
	}
}

type UpdateInventoryItemUsageRequest struct {
	ID            string `binding:"required" json:"id"`
	ItemID        string `binding:"required" json:"item_id"`
	OldUsageCount int    `binding:"required" json:"old_usage_count"`
	NewUsageCount int    `binding:"required" json:"new_usage_count"`
}

type UpdateInventoryItemUsageResponse struct {
	ID uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
}

func NewUpdateInventoryItemUsageResponse(usage *domain.InventoryItemUsage) UpdateInventoryItemUsageResponse {
	return UpdateInventoryItemUsageResponse{
		ID: usage.ID,
	}
}

type GetNonResellableInventoryRequest struct {
	Query string `form:"query"`
	Limit int    `form:"limit"`
}
type GetNonResellableInventoryResponse struct {
	ID       uuid.UUID `gorm:"" json:"id"`
	ItemCode string    `gorm:"" json:"item_code"`
}
type GetNonResellableInventoryListResponse struct {
	Items []GetNonResellableInventoryResponse `json:"items"`
}

func NewGetNonReservableInventoryResponse(item *domain.Inventory) GetNonResellableInventoryResponse {
	return GetNonResellableInventoryResponse{
		ID:       item.ID,
		ItemCode: item.ItemCode,
	}
}
func NewGetNonReservableInventoryListResponse(item []*domain.Inventory) GetNonResellableInventoryListResponse {
	var response []GetNonResellableInventoryResponse
	for _, u := range item {
		response = append(response, GetNonResellableInventoryResponse{
			ID:       u.ID,
			ItemCode: u.ItemCode,
		})
	}
	return GetNonResellableInventoryListResponse{
		Items: response,
	}
}

type CreateInventoryItemRestockRequst struct {
	ItemID    uuid.UUID `binding:"required" json:"item_id"`
	UnitPrice float64   `binding:"required" json:"unit_price"`
	Quantity  int       `binding:"required" json:"quantity"`
	Amount    float64   `binding:"required" json:"amount"`
	UserName  string    `binding:"required" json:"user_name"`
	Remark    string    `json:"remark"`
}

type CreateInventoryItemRestockResponse struct {
	ID        uuid.UUID `json:"id"`
	ItemID    uuid.UUID `json:"item_id"`
	Amount    float64   `json:"amount"`
	Quantity  int       `json:"quantity"`
	UnitPrice float64   `json:"unit_price"`
	UserName  string    `json:"user_name"`
	Remark    string    `json:"remark"`
	CreatedAt time.Time `json:"created_at"`
}

func NewCreateItemRestockResponse(restock *domain.InventoryItemRestock) *CreateInventoryItemRestockResponse {
	return &CreateInventoryItemRestockResponse{
		ID:        restock.ID,
		ItemID:    restock.ItemID,
		Amount:    restock.Amount,
		Quantity:  restock.Quantity,
		UnitPrice: restock.UnitPrice,
		UserName:  restock.UserName,
		Remark:    restock.Remark,
		CreatedAt: restock.CreatedAt,
	}
}

type UpdateInventoryItemRestockRequest struct {
	ID      string `binding:"required" json:"id"`
	IsPrint bool   `binding:"required" json:"is_print"`
}
type UpdateInventoryItemRestockResponse struct {
	ID      uuid.UUID `json:"id"`
	IsPrint bool      `json:"is_print"`
}

func NewUpdateInventoryItemRestockResponse(restock *domain.InventoryItemRestock) *UpdateInventoryItemRestockResponse {
	return &UpdateInventoryItemRestockResponse{
		ID:      restock.ID,
		IsPrint: restock.IsPrint,
	}
}

type GetInventoryItemRestockRequest struct {
	ItemID string `uri:"item-id" binding:"required" json:"item-id"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}
type InventoryItemsCode struct {
	ID       uuid.UUID `json:"id"`
	ItemCode string    `json:"item_code"`
}

type GetInventoryItemRestockResponse struct {
	ID        uuid.UUID            `json:"id"`
	ItemID    uuid.UUID            `json:"item_id"`
	Amount    float64              `json:"amount"`
	Quantity  int                  `json:"quantity"`
	UnitPrice float64              `json:"unit_price"`
	UserName  string               `json:"user_name"`
	Remark    string               `json:"remark"`
	IsPrint   bool                 `json:"is_print"`
	CreatedAt time.Time            `json:"created_at"`
	Items     []InventoryItemsCode `json:"inventory_items"`
}
type GetInventoryItemRestockListResponse struct {
	Items []GetInventoryItemRestockResponse `json:"items"`
	Total int                               `json:"total"`
}

func NewGetInventoryItemRestockResponse(restock *domain.InventoryItemRestock) *GetInventoryItemRestockResponse {
	var itemDTOs []InventoryItemsCode
	for _, item := range restock.Items {
		itemDTOs = append(itemDTOs, InventoryItemsCode{
			ID:       item.ID,
			ItemCode: item.ItemCode,
		})
	}
	return &GetInventoryItemRestockResponse{
		ID:        restock.ID,
		ItemID:    restock.ItemID,
		Amount:    restock.Amount,
		Quantity:  restock.Quantity,
		UnitPrice: restock.UnitPrice,
		UserName:  restock.User.FirstName + " " + restock.User.LastName,
		Remark:    restock.Remark,
		IsPrint:   restock.IsPrint,
		CreatedAt: restock.CreatedAt,
		Items:     itemDTOs,
	}
}
func NewGetInventoryItemRestockListResponse(restocks []*domain.InventoryItemRestock, total int) *GetInventoryItemRestockListResponse {
	items := make([]GetInventoryItemRestockResponse, len(restocks))
	for i, restock := range restocks {
		items[i] = *NewGetInventoryItemRestockResponse(restock)
	}
	return &GetInventoryItemRestockListResponse{
		Items: items,
		Total: total,
	}
}

type CreateInventoryItemAllocaationListRequest struct {
	Allocation AllocationWrapper `json:"allocation"`
}

// AllocationWrapper matches the object under "allocation"
type AllocationWrapper struct {
	Items     []CreateInventoryItemAllocationRequest `json:"items"`
	OrderID   *uuid.UUID                             `json:"order_id"`
	PackID    *uuid.UUID                             `json:"pack_id"`
	Allocator string                                 `binding:"required" json:"user_name"`
}

// Each item inside "items"
type CreateInventoryItemAllocationRequest struct {
	ItemID uuid.UUID `binding:"required" json:"item_id"`
	Count  int       `binding:"required" json:"count"`
}

type CreateInventoryItemAllocateResponse struct {
	ID        uuid.UUID  `gorm:"type:uuid;primary_key" json:"id"`
	ItemID    uuid.UUID  `gorm:"type:uuid;foreignKey:ItemID;references:ID" json:"item_id"`
	OrderID   *uuid.UUID `gorm:"type:uuid;foreignKey:OrderID;references:OrderID" json:"order_id"`
	PackID    *uuid.UUID `json:"pack_id"`
	Count     int        `gorm:"type:int;not null" json:"count"`
	Allocator string     `gorm:"type:varchar(100);not null" json:"user_name"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func NewGetCreateInventoryItemAllocateResponse(inventoryItemAllocate *domain.InventoryItemAllocate) *CreateInventoryItemAllocateResponse {
	var orderIDPtr *uuid.UUID
	if inventoryItemAllocate.OrderID != uuid.Nil {
		val := inventoryItemAllocate.OrderID
		orderIDPtr = &val
	}

	var packIDPtr *uuid.UUID
	if inventoryItemAllocate.PackID != uuid.Nil {
		val := inventoryItemAllocate.PackID
		packIDPtr = &val
	}
	return &CreateInventoryItemAllocateResponse{
		ID:        inventoryItemAllocate.ID,
		ItemID:    inventoryItemAllocate.ItemID,
		OrderID:   orderIDPtr,
		PackID:    packIDPtr,
		Count:     inventoryItemAllocate.Count,
		Allocator: inventoryItemAllocate.Allocator,
		CreatedAt: inventoryItemAllocate.CreatedAt,
	}
}

type GetInventoryItemAllocationQuery struct {
	OrderID string `form:"order_id"`
	ItemID  string `form:"item_id"`
	PackID  string `form:"pack_id"`
	Limit   int    `form:"limit"`
	Offset  int    `form:"offset"`
}

type GetInventoryItemAllocationResponse struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	ItemID    uuid.UUID `gorm:"type:uuid;foreignKey:ItemID;references:ID" json:"item_id"`
	ItemCode  string    `gorm:"type:varchar(100);not null" json:"item_code"`
	ItemName  string    `gorm:"type:varchar(100);not null" json:"item_name"`
	OrderID   uuid.UUID `gorm:"type:uuid;foreignKey:OrderID;references:OrderID" json:"order_id"`
	OrderType string    `gorm:"type:varchar(100);not null" json:"order_type"`
	OrederNo  string    `gorm:"type:varchar(100);not null" json:"order_no"`
	PackID    uuid.UUID `json:"pack_id"`
	SerialNo  string    `json:"serial_no"`
	Count     int       `gorm:"type:int;not null" json:"usage_count"`
	Allocator string    `gorm:"type:varchar(100);not null" json:"user_name"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
type GetInventoryItemAllocationListResponse struct {
	Items []GetInventoryItemAllocationResponse `json:"items"`
	Total int                                  `json:"total"`
}

func NewGetInventoryItemAllocationoResponse(allocation *domain.InventoryItemAllocate) *GetInventoryItemAllocationResponse {
	return &GetInventoryItemAllocationResponse{
		ID:        allocation.ID,
		ItemID:    allocation.ItemID,
		ItemCode:  allocation.ItemCode,
		ItemName:  allocation.ItemName,
		OrderID:   allocation.OrderID,
		OrderType: allocation.OrderType,
		OrederNo:  allocation.OrderNo,
		PackID:    allocation.PackID,
		SerialNo:  allocation.SerialNo,
		Count:     allocation.Count,
		Allocator: allocation.User.FirstName + " " + allocation.User.LastName,
		CreatedAt: allocation.CreatedAt,
	}
}
func NewGetInventoryItemAllocationListResponse(allocation []*domain.InventoryItemAllocate, total int) *GetInventoryItemAllocationListResponse {
	items := make([]GetInventoryItemAllocationResponse, len(allocation))
	for i, allocation := range allocation {
		items[i] = *NewGetInventoryItemAllocationoResponse(allocation)
	}
	return &GetInventoryItemAllocationListResponse{
		Items: items,
		Total: total,
	}
}

type DeleteInventoryItemAllocationRequest struct {
	ID     string    `binding:"required" json:"id"`
	ItemID uuid.UUID `binding:"required" json:"item_id"`
	Count  int       `binding:"required" json:"count"`
}
type DeleteInventoryItemAllocationResponse struct {
	ID uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
}

func NewDeleteInventoryItemAllocationResponse(Allocation *domain.InventoryItemAllocate) DeleteInventoryItemAllocationResponse {
	return DeleteInventoryItemAllocationResponse{
		ID: Allocation.ID,
	}
}

type UpdateInventoryItemAllocationRequest struct {
	ID       string    `binding:"required" json:"id"`
	ItemID   uuid.UUID `binding:"required" json:"item_id"`
	OldCount int       `binding:"required" json:"old_count"`
	Count    int       `binding:"required" json:"count"`
}

type UpdateInventoryItemAllocationResponse struct {
	ID uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
}

func NewUpdateInventoryItemAllocationResponse(allocation *domain.InventoryItemAllocate) UpdateInventoryItemAllocationResponse {
	return UpdateInventoryItemAllocationResponse{
		ID: allocation.ID,
	}
}

type GetInventoryItemByCodeRequest struct {
	Query string `form:"query"`
}

type GetInventoryItemByCodeResponse struct {
	ID       uuid.UUID `json:"id"`
	ItemCode string    `json:"item_code"`
	ItemName string    `json:"item_name"`
}

func NewGetInventoryItemByCodeResponse(inventory *domain.InventoryItem) *GetInventoryItemByCodeResponse {
	itemName := ""
	if inventory.Inventory != nil {
		itemName = inventory.Inventory.ItemName
	}
	return &GetInventoryItemByCodeResponse{
		ID:       inventory.ID,
		ItemCode: inventory.ItemCode,
		ItemName: itemName,
	}
}

type CreateInventoryOrderRequest struct {
	ItemCode      string  `json:"item_code" binding:"required"`
	ItemName      string  `json:"item_name" binding:"required"`
	OrderQuantity int     `json:"order_quantity" binding:"required"`
	Quantity      int     `json:"quantity"`
	Amount        float64 `json:"amount" binding:"required"`
	OrderDate     string  `json:"order_date"`
	CreatedBy     string  `json:"created_by" binding:"required"`
}
type CreateInventoryOrderResponse struct {
	ID            uuid.UUID `json:"id"`
	OrderNo       string    `json:"order_no"`
	ItemCode      string    `json:"item_code" `
	OrderQuantity int       `json:"order_quantity" binding:"required"`
	CreatedBy     string    `json:"created_by" binding:"required"`
}

func NewCreateInventoryOrderResponse(inventoryOrder *domain.InventoryOrder) *CreateInventoryOrderResponse {
	return &CreateInventoryOrderResponse{
		ID:            inventoryOrder.ID,
		OrderNo:       inventoryOrder.OrderNo,
		ItemCode:      inventoryOrder.ItemCode,
		OrderQuantity: inventoryOrder.OrderQuantity,
		CreatedBy:     inventoryOrder.CreatedBy,
	}
}

type GetInventoryOrdersRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type GetInventoryOrdersResponse struct {
	ID            uuid.UUID `json:"id"`
	OrderNo       string    `json:"order_no"`
	ItemCode      string    `json:"item_code"`
	ItemName      string    `json:"item_name"`
	OrderQuantity int       `json:"order_quantity"`
	Quantity      int       `json:"quantity"`
	Amount        float64   `json:"amount"`
	OrderDate     string    `json:"order_date"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type GetAllInventoryOrderResponse struct {
	Orders               []GetInventoryOrdersResponse `json:"orders"`
	Total                int                          `json:"total"`
	TotalInventoryOrders int                          `json:"total_inventory_orders"`
}

func NewGetInventoryOrdersResponse(inventoryOrder *domain.InventoryOrder) *GetInventoryOrdersResponse {
	return &GetInventoryOrdersResponse{
		ID:            inventoryOrder.ID,
		OrderNo:       inventoryOrder.OrderNo,
		ItemCode:      inventoryOrder.ItemCode,
		ItemName:      inventoryOrder.ItemName,
		OrderQuantity: inventoryOrder.OrderQuantity,
		Quantity:      inventoryOrder.Quantity,
		Amount:        inventoryOrder.Amount,
		OrderDate:     inventoryOrder.OrderDate,
		Status:        inventoryOrder.Status,
		CreatedAt:     inventoryOrder.CreatedAt,
		UpdatedAt:     inventoryOrder.UpdatedAt,
	}
}
func NewGetAllInventoryOrdersResponse(inventoryOrders []*domain.InventoryOrder, totalInventoryOrders int) *GetAllInventoryOrderResponse {
	items := make([]GetInventoryOrdersResponse, len(inventoryOrders))
	for i, inventory := range inventoryOrders {
		items[i] = *NewGetInventoryOrdersResponse(inventory)
	}
	return &GetAllInventoryOrderResponse{
		Orders:               items,
		TotalInventoryOrders: totalInventoryOrders,
		Total:                len(items),
	}
}

type DeleteInventoryOrderIdRequest struct {
	OrderId string `uri:"order-id" binding:"required" json:"order_id"`
}

type DeleteInventoryOrderResponse struct {
	ID      uuid.UUID `json:"id"`
	OrderNo string    `json:"order_no"`
}

func NewDeleteInventoryOrderResponse(inventoryOrder *domain.InventoryOrder) DeleteInventoryOrderResponse {
	return DeleteInventoryOrderResponse{
		ID:      inventoryOrder.ID,
		OrderNo: inventoryOrder.OrderNo,
	}
}

type UpdateInventoryOrderRequest struct {
	ID            string  `uri:"order-id" binding:"required" json:"id"`
	ItemCode      string  `json:"item_code"`
	ItemName      string  `json:"item_name"`
	OrderQuantity int     `json:"order_quantity"`
	Quantity      int     `json:"quantity"`
	Amount        float64 `json:"amount"`
	Status        string  `json:"status"`
	OrderDate     string  `json:"order_date"`
}

type UpdateInventoryOrderResponse struct {
	ID      uuid.UUID `uri:"order-id" binding:"required" json:"id"`
	OrderNo string    `json:"order_no"`
}

func NewUpdateInventoryOrderResponse(inventoryOrder *domain.InventoryOrder) *UpdateInventoryOrderResponse {
	return &UpdateInventoryOrderResponse{
		ID:      inventoryOrder.ID,
		OrderNo: inventoryOrder.OrderNo,
	}
}

type CreateInventoryFromOrderRequest struct {
	OrderID  uuid.UUID `json:"order_id"`
	ItemCode string    `json:"item_code" binding:"required"`
	ItemName string    `json:"item_name" binding:"required"`
	UnitCost float64   `json:"unit_cost" binding:"required"`
	Quantity int       `json:"quantity" binding:"required"`
	Amount   float64   `json:"amount" binding:"required"`
	UserName string    `json:"user_name" binding:"required"`
	Codes    []string  `json:"codes" binding:"required"`
	Remark   string    `json:"remark"`
}
type CreateInventoryFromOrderResponse struct {
	ItemCode string `json:"item_code"`
	ItemName string `json:"item_name"`
	Quantity int    `json:"quantity"`
}

func NewCreateInventoryFromOrderResponse(inventory *domain.Inventory) *CreateInventoryFromOrderResponse {
	return &CreateInventoryFromOrderResponse{
		ItemCode: inventory.ItemCode,
		ItemName: inventory.ItemName,
	}
}
