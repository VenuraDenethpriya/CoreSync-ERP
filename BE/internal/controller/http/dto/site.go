package dto

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
)

type CreateSiteRequest struct {
	OrderId     uuid.UUID `json:"order_id"`
	Location    string    `json:"location"`
	Assingee    []string  `json:"assginee"`
	Date        time.Time `json:"date"`
	StartTime   string    `json:"start_time"`
	EndTime     string    `json:"end_time"`
	Capacity    float64   `json:"capacity"`
	PanelType   string    `json:"panel_type"`
	SolarType   string    `json:"solar_type"`
	Inverter    string    `json:"inverter"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	CratedBy    string    `json:"created_by"`
}

type CreateSiteResponse struct {
	ID            uuid.UUID `json:"id"`
	OrderId       uuid.UUID `json:"order_id"`
	Location      string    `json:"location"`
	Assingee      []string  `json:"assginee"`
	Date          time.Time `json:"date"`
	StartTime     string    `json:"start_time"`
	EndTime       string    `json:"end_time"`
	Capacity      float64   `json:"capacity"`
	PanelType     string    `json:"panel_type"`
	SolarType     string    `json:"solar_type"`
	Inverter      string    `json:"inverter"`
	Description   string    `json:"description"`
	CratedBy      string    `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
	Status        string    `json:"status"`
	CustomerName  string    `json:"customer_name"`
	CustomerPhone string    `json:"customer_phone"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func NewCreateSiteResponse(site *domain.Site) *CreateSiteResponse {
	customerName := ""
	customerPhone := ""

	if site.Order != nil && site.Order.Customer != nil {
		customerName = site.Order.Customer.FirstName + " " + site.Order.Customer.LastName
		customerPhone = site.Order.Customer.PhoneNo1
	}

	return &CreateSiteResponse{
		ID:            site.ID,
		OrderId:       site.OrderID,
		Location:      site.Location,
		Assingee:      site.Assignee,
		Date:          site.Date,
		StartTime:     site.StartTime,
		EndTime:       site.EndTime,
		Capacity:      site.Capacity,
		PanelType:     site.PanelType,
		SolarType:     site.SolarType,
		Inverter:      site.Inverter,
		Description:   site.Description,
		Status:        site.Status,
		CustomerName:  customerName,
		CustomerPhone: customerPhone,
		CratedBy:      site.CreatedBy,
		CreatedAt:     site.CreatedAt,
		UpdatedAt:     site.UpdatedAt,
	}
}

type GetSiteRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type GetSiteResponse struct {
	ID          uuid.UUID `json:"id"`
	OrderId     uuid.UUID `json:"order_id"`
	OrderNo     string    `json:"order_no"`
	Location    string    `json:"location"`
	Assingee    []string  `json:"assginee"`
	Date        time.Time `json:"date"`
	StartTime   string    `json:"start_time"`
	EndTime     string    `json:"end_time"`
	Capacity    float64   `json:"capacity"`
	PanelType   string    `json:"panel_type"`
	SolarType   string    `json:"solar_type"`
	Inverter    string    `json:"inverter"`
	Status      string    `json:"status"`
	Description string    `json:"description"`
	CratedBy    string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type GetSitesResponse struct {
	Site       []GetSiteResponse `json:"site"`
	Total      int               `json:"total"`
	TotalSites int               `json:"total_sites"`
}

func NewGetSiteResponse(sites []*domain.Site, totalSites int) *GetSitesResponse {
	var response []GetSiteResponse

	if response == nil {
		response = make([]GetSiteResponse, 0)
	}

	for _, s := range sites {
		orderFormattedStr := ""
		if s.Order != nil {
			orderFormattedStr = s.Order.Type + "" + s.Order.OrderNo
		}

		response = append(response, GetSiteResponse{
			ID:          s.ID,
			OrderId:     s.OrderID,
			OrderNo:     orderFormattedStr,
			Location:    s.Location,
			Assingee:    s.Assignee,
			Date:        s.Date,
			StartTime:   s.StartTime,
			EndTime:     s.EndTime,
			Capacity:    s.Capacity,
			PanelType:   s.PanelType,
			SolarType:   s.SolarType,
			Inverter:    s.Inverter,
			Status:      s.Status,
			Description: s.Description,
			CratedBy:    s.CreatedBy,
			CreatedAt:   s.CreatedAt,
			UpdatedAt:   s.UpdatedAt,
		})
	}

	return &GetSitesResponse{
		Site:       response,
		Total:      len(response),
		TotalSites: totalSites,
	}
}

type GetSiteIdRequest struct {
	ID string `uri:"siteId" json:"siteId"`
}

type GetSiteByIdResponse struct {
	ID          uuid.UUID `json:"id"`
	OrderId     uuid.UUID `json:"order_id"`
	OrderNo     string    `json:"order_no"`
	Location    string    `json:"location"`
	Assingee    []string  `json:"assginee"`
	Date        time.Time `json:"date"`
	StartTime   string    `json:"start_time"`
	EndTime     string    `json:"end_time"`
	Capacity    float64   `json:"capacity"`
	PanelType   string    `json:"panel_type"`
	SolarType   string    `json:"solar_type"`
	Inverter    string    `json:"inverter"`
	Description string    `json:"description"`
	CratedBy    string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	Status      string    `json:"status"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func NewGetSiteByIdResponse(site *domain.Site) *GetSiteByIdResponse {
	orderFormattedStr := ""
	if site.Order != nil {
		orderFormattedStr = site.Order.Type + "" + site.Order.OrderNo
	}

	return &GetSiteByIdResponse{
		ID:          site.ID,
		OrderId:     site.OrderID,
		OrderNo:     orderFormattedStr,
		Location:    site.Location,
		Assingee:    site.Assignee,
		Date:        site.Date,
		StartTime:   site.StartTime,
		EndTime:     site.EndTime,
		Capacity:    site.Capacity,
		PanelType:   site.PanelType,
		SolarType:   site.SolarType,
		Inverter:    site.Inverter,
		Description: site.Description,
		Status:      site.Status,
		CratedBy:    site.CreatedBy,
		CreatedAt:   site.CreatedAt,
		UpdatedAt:   site.UpdatedAt,
	}
}

type DeleteSiteRequest struct {
	SiteID string `uri:"siteId" json:"siteId"`
}

type DeleteSiteResponse struct {
	ID uuid.UUID `json:"id"`
}

func NewDeleteSiteResponse(site *domain.Site) *DeleteSiteResponse {
	return &DeleteSiteResponse{
		ID: site.ID,
	}
}

type UpdateSiteRequest struct {
	ID          uuid.UUID `json:"id" binding:"required"`
	OrderId     uuid.UUID `json:"order_id"`
	Location    string    `json:"location"`
	Assingee    []string  `json:"assginee"`
	Date        time.Time `json:"date"`
	StartTime   string    `json:"start_time"`
	EndTime     string    `json:"end_time"`
	Capacity    float64   `json:"capacity"`
	PanelType   string    `json:"panel_type"`
	SolarType   string    `json:"solar_type"`
	Inverter    string    `json:"inverter"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type UpdateSiteResponse struct {
	ID          uuid.UUID `json:"id" binding:"required"`
	OrderId     uuid.UUID `json:"order_id"`
	OrderNo     string    `josn:"order_no"`
	Location    string    `json:"location"`
	Assingee    []string  `json:"assginee"`
	Date        time.Time `json:"date"`
	StartTime   string    `json:"start_time"`
	EndTime     string    `json:"end_time"`
	Capacity    float64   `json:"capacity"`
	PanelType   string    `json:"panel_type"`
	SolarType   string    `json:"solar_type"`
	Inverter    string    `json:"inverter"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func NewUpdateSiteResponse(site *domain.Site) *UpdateSiteResponse {
	orderFormattedStr := ""
	if site.Order != nil {
		orderFormattedStr = site.Order.Type + "" + site.Order.OrderNo
	}

	return &UpdateSiteResponse{
		ID:          site.ID,
		OrderId:     site.OrderID,
		OrderNo:     orderFormattedStr,
		Location:    site.Location,
		Assingee:    site.Assignee,
		Date:        site.Date,
		StartTime:   site.StartTime,
		EndTime:     site.EndTime,
		Capacity:    site.Capacity,
		PanelType:   site.PanelType,
		SolarType:   site.SolarType,
		Inverter:    site.Inverter,
		Description: site.Description,
		Status:      site.Status,
		UpdatedAt:   site.UpdatedAt,
	}
}
