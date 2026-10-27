package dto

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
)

type CreateCasingRequest struct {
	ProductID uuid.UUID `json:"product_id" binding:"required"`
	Quantity  int       `json:"quantity" binding:"required,min=1"`
	Note      string    `json:"note"`
	CreatedBy string    `json:"created_by" binding:"required"`
}

type CreateCasingResponse struct {
	IDs []uuid.UUID `json:"ids"`
}

func NewCreateCasingResponse(ids []uuid.UUID) *CreateCasingResponse {
	return &CreateCasingResponse{
		IDs: ids,
	}
}

type GetCasingRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type GetCasingResponse struct {
	ID          uuid.UUID `json:"id"`
	SerialNo    string    `json:"serial_no"`
	ProductID   uuid.UUID `json:"product_id"`
	ProductName string    `json:"product_name"`
	Note        string    `json:"note"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
}
type GetCasingListResponse struct {
	Casings     []GetCasingResponse `json:"casings"`
	Total       int64               `json:"total"`
	TotalCasing int64               `json:"total_casing"`
}

func NewGetCasingListResponse(casings []*domain.Casing, totalCasing int64) *GetCasingListResponse {
	var casingResponses []GetCasingResponse
	for _, wire_harness := range casings {
		casingResponses = append(casingResponses, GetCasingResponse{
			ID:          wire_harness.ID,
			SerialNo:    wire_harness.SerialNo,
			ProductID:   wire_harness.ProductID,
			ProductName: wire_harness.Product.Name,
			Note:        wire_harness.Note,
			CreatedBy:   wire_harness.User.FirstName + " " + wire_harness.User.LastName,
			CreatedAt:   wire_harness.CreatedAt,
		})
	}
	return &GetCasingListResponse{
		Casings:     casingResponses,
		Total:       int64(len(casingResponses)),
		TotalCasing: totalCasing,
	}
}

type CreateWireHarnessRequest struct {
	ProductID uuid.UUID `json:"product_id" binding:"required"`
	Quantity  int       `json:"quantity" binding:"required,min=1"`
	Note      string    `json:"note"`
	CreatedBy string    `json:"created_by" binding:"required"`
}

type CreateWireHarnessResponse struct {
	IDs []uuid.UUID `json:"ids"`
}

func NewCreateWireHarnessResponse(ids []uuid.UUID) *CreateWireHarnessResponse {
	return &CreateWireHarnessResponse{
		IDs: ids,
	}
}

type GetWireHarnessRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type GetWireHarnessResponse struct {
	ID          uuid.UUID `json:"id"`
	SerialNo    string    `json:"serial_no"`
	ProductID   uuid.UUID `json:"product_id"`
	ProductName string    `json:"product_name"`
	Note        string    `json:"note"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
}
type GetWireHarnessListResponse struct {
	WireHarness      []GetWireHarnessResponse `json:"wire_harness"`
	Total            int64                    `json:"total"`
	TotalWireHarness int64                    `json:"total_wire_harness"`
}

func NewGetWireHarnessListResponse(wire_harnesses []*domain.WireHarness, totalWireHarness int64) *GetWireHarnessListResponse {
	var wireHarnessResponses []GetWireHarnessResponse
	for _, wire_harness := range wire_harnesses {
		wireHarnessResponses = append(wireHarnessResponses, GetWireHarnessResponse{
			ID:          wire_harness.ID,
			SerialNo:    wire_harness.SerialNo,
			ProductID:   wire_harness.ProductID,
			ProductName: wire_harness.Product.Name,
			Note:        wire_harness.Note,
			CreatedBy:   wire_harness.User.FirstName + " " + wire_harness.User.LastName,
			CreatedAt:   wire_harness.CreatedAt,
		})
	}
	return &GetWireHarnessListResponse{
		WireHarness:      wireHarnessResponses,
		Total:            int64(len(wireHarnessResponses)),
		TotalWireHarness: totalWireHarness,
	}
}
