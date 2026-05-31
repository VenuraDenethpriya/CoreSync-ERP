package dto

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
)

type CreateRepairRequest struct {
	OrderId       uuid.UUID `json:"order_id"`
	JobNo         string    `json:"job_no" binding:"required"`
	Description   string    `json:"description"`
	Status        string    `json:"status"`
	Price         float64   `json:"price"`
	DueDate       time.Time `json:"due_date" binding:"required"`
	CreatedBy     string    `json:"created_by" binding:"required"`
	CustomerName  string    `json:"customer_name" binding:"required"`
	CustomerPhone string    `json:"customer_phone" binding:"required"`
	// CreatedAt     time.Time `json:"created_at" binding:"required"`
	// UpdatedAt     time.Time `json:"updated_at" binding:"required"`
}

type CreateRepairResponse struct {
	RepairId uuid.UUID `json:"repair_id"`
	JobNo    string    `json:"job_no"`
}

func NewCreateRepairResponse(sale *domain.Repair) *CreateRepairResponse {
	return &CreateRepairResponse{
		RepairId: sale.ID,
		JobNo:    sale.JobNo,
	}
}

type GetRepairsRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}
type GetRepairResponse struct {
	ID            uuid.UUID `json:"repair_id"`
	JobNo         string    `json:"job_no"`
	CustomerName  string    `json:"customer_name"`
	CustomerPhone string    `json:"customer_phone"`
	Status        string    `json:"status"`
	DueDate       time.Time `json:"due_date"`
	Price         float64   `json:"price"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
type GetRepairsResponse struct {
	Repairs      []GetRepairResponse `json:"repairs"`
	Total        int                 `json:"total"`
	TotalRepairs int                 `json:"total_repairs"`
}

func NewGetRepairsResponse(repair []*domain.Repair, totalRepairs int) *GetRepairsResponse {
	var response []GetRepairResponse
	for _, r := range repair {
		response = append(response, GetRepairResponse{
			ID:            r.ID,
			JobNo:         r.JobNo,
			CustomerName:  r.CustomerName,
			CustomerPhone: r.CustomerPhone,
			Status:        r.Status,
			DueDate:       r.DueDate,
			Price:         r.Price,
			CreatedAt:     r.CreatedAt,
			UpdatedAt:     r.UpdatedAt,
		})
	}
	return &GetRepairsResponse{
		Repairs:      response,
		TotalRepairs: totalRepairs,
		Total:        len(repair),
	}
}

type GetRepairIDRequest struct {
	ID string `uri:"repair-id" binding:"required"`
}
type GetRepairIDResponse struct {
	ID            uuid.UUID `json:"repair_id"`
	JobNo         string    `json:"job_no"`
	OrderID       uuid.UUID `json:"order_id"`
	OrderNo       string    `json:"order_no"`
	CustomerName  string    `json:"customer_name"`
	CustomerPhone string    `json:"customer_phone"`
	Price         float64   `json:"price"`
	Status        string    `json:"status"`
	Description   string    `json:"description"`
	DueDate       time.Time `json:"due_date"`
	CreatedBy     string    `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func NewGetRepairIDResponse(repair *domain.Repair) *GetRepairIDResponse {
	fullName := repair.User.FirstName + " " + repair.User.LastName
	orderNo := repair.Order.Type + "" + repair.Order.OrderNo
	return &GetRepairIDResponse{
		ID:            repair.ID,
		JobNo:         repair.JobNo,
		OrderID:       repair.OrderId,
		OrderNo:       orderNo,
		CustomerName:  repair.CustomerName,
		CustomerPhone: repair.CustomerPhone,
		Status:        repair.Status,
		Price:         repair.Price,
		Description:   repair.Description,
		DueDate:       repair.DueDate,
		CreatedBy:     fullName,
		CreatedAt:     repair.CreatedAt,
		UpdatedAt:     repair.UpdatedAt,
	}
}

type DeleteRepairIDRequest struct {
	RepairID string `uri:"repair-id" binding:"required" json:"repair_id"`
}
type DeleteRepairIDResponse struct {
	ID           uuid.UUID `json:"repair_id"`
	JobNo        string    `json:"job_no"`
	CustomerName string    `json:"customer_name"`
}

func NewDeleteRepairIDResponse(repair *domain.Repair) *DeleteRepairIDResponse {
	return &DeleteRepairIDResponse{
		ID:           repair.ID,
		JobNo:        repair.JobNo,
		CustomerName: repair.CustomerName,
	}
}

type UpdateRepairIDRequest struct {
	ID string `uri:"repair-id" binding:"required" json:"repair_id"`
}

type UpdateRepairRequest struct {
	ID            string    `json:"repair_id" binding:"required"`
	OrderId       uuid.UUID `json:"order_id"`
	Description   string    `json:"description"`
	Status        string    `json:"status"`
	CustomerName  string    `json:"customer_name"`
	CustomerPhone string    `json:"customer_phone"`
	Price         float64   `json:"price"`
	DueDate       time.Time `json:"due_date"`
}

type UpdateRepairResponse struct {
	ID            uuid.UUID `json:"repair_id"`
	JobNo         string    `json:"job_no"`
	OrderNo       string    `json:"order_no"`
	CustomerName  string    `json:"customer_name"`
	CustomerPhone string    `json:"customer_phone"`
	Status        string    `json:"status"`
	Description   string    `json:"description"`
	DueDate       time.Time `json:"due_date"`
	Price         float64   `json:"price"`
	CreatedBy     string    `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func NewUpdateRepairResponse(repair *domain.Repair) *UpdateRepairResponse {
	var fullName string
	if repair.User != nil {
		fullName = repair.User.FirstName + " " + repair.User.LastName
	} else {
		fullName = repair.CreatedBy
	}

	var orderNo string
	if repair.Order != nil {
		orderNo = repair.Order.Type + "" + repair.Order.OrderNo
	}
	return &UpdateRepairResponse{
		ID:            repair.ID,
		JobNo:         repair.JobNo,
		OrderNo:       orderNo,
		CustomerName:  repair.CustomerName,
		CustomerPhone: repair.CustomerPhone,
		Status:        repair.Status,
		Description:   repair.Description,
		DueDate:       repair.DueDate,
		Price:         repair.Price,
		CreatedBy:     fullName,
		CreatedAt:     repair.CreatedAt,
		UpdatedAt:     repair.UpdatedAt,
	}
}

type GetLastRepairNoResponse struct {
	LastRepairNo string `json:"last_job_no"`
}

func NewGetLastRepairNoResponse(lastRepairNo string) *GetLastRepairNoResponse {
	return &GetLastRepairNoResponse{
		LastRepairNo: lastRepairNo,
	}
}

type CreateRepairItemUsageRequest struct {
	ItemID   uuid.UUID `binding:"required" json:"item_id"`
	RepairID uuid.UUID `binding:"required" json:"repair_id"`
	// UsageCount int       `binding:"required" json:"usage_count"`
	UserName string `binding:"required" json:"user_name"`
}

type CreateRepairItemUsageListRequest struct {
	Usages []CreateRepairItemUsageRequest `json:"repair_usages"`
}

type CreateRepairItemUsageResponse struct {
	ID       uuid.UUID `json:"id"`
	ItemID   uuid.UUID `json:"item_id"`
	RepairID uuid.UUID `json:"repair_id"`
	// UsageCount int       `gorm:"type:int;not null" json:"usage_count"`
	UserName  string    `json:"user_name"`
	CreatedAt time.Time `json:"created_at"`
}

func NewGetCreateRepairItemUsageResponse(repairItemUsage *domain.RepairItemUsage) *CreateRepairItemUsageResponse {
	return &CreateRepairItemUsageResponse{
		ID:       repairItemUsage.ID,
		ItemID:   repairItemUsage.ItemID,
		RepairID: repairItemUsage.RepairID,
		// UsageCount: repairItemUsage.UsageCount,
		UserName:  repairItemUsage.UserName,
		CreatedAt: repairItemUsage.CreatedAt,
	}
}

type GetRepairItemUsageQuery struct {
	JobID  string `form:"job_id"`
	ItemID string `form:"item_id"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type GetRepairItemUsageResponse struct {
	ID            uuid.UUID `json:"id"`
	InventoryID   uuid.UUID `json:"inventory_id"`
	InventoryCode string    `json:"inventory_code"`
	InventoryName string    `json:"inventory_name"`
	ItemID        uuid.UUID `json:"item_id"`
	ItemCode      string    `json:"item_code"`
	JobID         uuid.UUID `json:"job_id"`
	JobNo         string    `json:"job_no"`
	// UsageCount    int       `json:"usage_count"`
	UserName  string    `json:"user_name"`
	CreatedAt time.Time `json:"created_at"`
}

type GetRepairItemUsageListResponse struct {
	Items []GetRepairItemUsageResponse `json:"items"`
	Total int                          `json:"total"`
}

func NewGetRepairItemUsageResponse(usage *domain.RepairItemUsage) *GetRepairItemUsageResponse {
	// Name construction
	userName := usage.UserName
	if usage.User != nil {
		userName = usage.User.FirstName + " " + usage.User.LastName
	}

	return &GetRepairItemUsageResponse{
		ID:            usage.ID,
		InventoryID:   usage.InventoryID,
		InventoryCode: usage.InventoryCode,
		InventoryName: usage.InventoryName,
		// InventoryID:   usage.InventoryItem.ItemID,
		// InventoryCode: usage.InventoryItem.ItemCode,
		// InventoryName: usage.InventoryItem.ItemName,
		ItemID:   usage.ItemID,
		ItemCode: usage.ItemCode,
		JobID:    usage.RepairID,
		JobNo:    usage.JobNo,
		// UsageCount: usage.UsageCount,
		UserName:  userName,
		CreatedAt: usage.CreatedAt,
	}
}

func NewGetRepairItemUsageListResponse(usages []*domain.RepairItemUsage, total int) *GetRepairItemUsageListResponse {
	items := make([]GetRepairItemUsageResponse, len(usages))
	for i, usage := range usages {
		items[i] = *NewGetRepairItemUsageResponse(usage)
	}
	return &GetRepairItemUsageListResponse{
		Items: items,
		Total: total,
	}
}

type RepairUsageItemDetail struct {
	UsageID   uuid.UUID `json:"usage_id"`
	ItemID    uuid.UUID `json:"item_id"`
	ItemCode  string    `json:"item_code"`
	CreatedAt time.Time `json:"created_at"`
}

type RepairGroupedUsageResponse struct {
	ID uuid.UUID `json:"id"`

	JobID    *uuid.UUID `json:"job_id,omitempty"`
	JobNo    string     `json:"job_no,omitempty"`
	UserName string     `json:"user_name,omitempty"`

	InventoryID   *uuid.UUID `json:"inventory_id,omitempty"`
	InventoryCode string     `json:"inventory_code,omitempty"`
	InventoryName string     `json:"inventory_name,omitempty"`

	TotalUsage int `json:"total_usage"`

	Items []RepairUsageItemDetail `json:"items"`
}

type GetRepairItemUsageGroupedListResponse struct {
	Items []RepairGroupedUsageResponse `json:"items"`
	Total int                          `json:"total"`
}

func NewGetRepairItemUsageGroupedListResponse(
	usages []*domain.RepairItemUsage,
	total int,
	mode string,
) *GetRepairItemUsageGroupedListResponse {

	groups := make(map[uuid.UUID]*RepairGroupedUsageResponse)
	order := make([]uuid.UUID, 0)

	for _, u := range usages {
		var key uuid.UUID

		if mode == "job" {
			key = u.RepairID
		} else {
			key = u.InventoryID
		}

		if key == uuid.Nil {

		}

		if _, exists := groups[key]; !exists {
			g := &RepairGroupedUsageResponse{
				ID:         key,
				Items:      []RepairUsageItemDetail{},
				TotalUsage: 0,
			}

			if mode == "job" {
				g.JobID = &u.RepairID
				g.JobNo = u.JobNo
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

		groups[key].Items = append(groups[key].Items, RepairUsageItemDetail{
			UsageID:   u.ID,
			ItemID:    u.ItemID,
			ItemCode:  u.ItemCode,
			CreatedAt: u.CreatedAt,
		})

		groups[key].TotalUsage++
	}

	result := make([]RepairGroupedUsageResponse, 0, len(order))
	for _, id := range order {
		result = append(result, *groups[id])
	}

	return &GetRepairItemUsageGroupedListResponse{
		Items: result,
		Total: total,
	}
}
