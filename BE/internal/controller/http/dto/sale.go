package dto

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
)

// Sales DTOs
type CreateSaleRequest struct {
	Salesperson   uuid.UUID `json:"salesperson" binding:"required"`
	Type          string    `json:"type"`
	Status        string    `json:"status"`
	Commission    float64   `json:"commission"`
	Date          time.Time `json:"date"`
	CustomerName  string    `json:"customer_name"`
	CustomerPhone string    `json:"customer_phone"`
	Description   string    `json:"description"`
	RecordingURL  string    `json:"recording_url"`
	UpdatedBy     string    `json:"updated_by"`
}

type CreateSaleResponse struct {
	ID            uuid.UUID `json:"id"`
	SalesNo       string    `json:"sales_no"`
	Salesperson   uuid.UUID `json:"salesperson"`
	Type          string    `json:"type"`
	Status        string    `json:"status"`
	Commission    *float64  `json:"commission"`
	Date          time.Time `json:"date"`
	CustomerName  string    `json:"customer_name"`
	CustomerPhone string    `json:"customer_phone"`
	Description   string    `json:"description"`
	RecordingURL  string    `json:"recording_url"`
	UpdatedBy     string    `json:"updated_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func NewCreateSaleResponse(sale *domain.Sale) *CreateSaleResponse {
	return &CreateSaleResponse{
		ID:            sale.SalesID,
		SalesNo:       sale.SalesNo,
		Salesperson:   sale.Salesperson,
		Type:          sale.SalesType,
		Status:        sale.Status,
		Commission:    sale.Commission,
		Date:          sale.Date,
		CustomerName:  sale.CustomerName,
		CustomerPhone: sale.CustomerPhone,
		Description:   sale.Description,
		RecordingURL:  sale.RecordingURL,
		UpdatedBy:     sale.UpdatedBy,
		CreatedAt:     sale.CreatedAt,
		UpdatedAt:     sale.UpdatedAt,
	}
}

type GetSalesRequest struct {
	Query  string `form:"query"`
	Status string `form:"status"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type GetSalesResponse struct {
	ID            uuid.UUID `json:"id"`
	SalesNo       string    `json:"sale_no"`
	Salesperson   string    `json:"salesperson"`
	Type          string    `json:"type"`
	Status        string    `json:"status"`
	Commission    float64   `json:"commission"`
	Date          time.Time `json:"date"`
	CustomerName  string    `json:"customer_name"`
	CustomerPhone string    `json:"customer_phone"`
	Description   string    `json:"description"`
	RecordingURL  string    `json:"recording_url"`
	// UpdatedBy     string    `json:"updated_by"`
	UpdatedByName string    `json:"updated_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type GetSalesResponses struct {
	Sales      []GetSalesResponse `json:"sales"`
	Total      int64              `json:"total"`
	TotalSales int64              `json:"total_sales"`
}

func NewGetSalesResponse(sale *domain.Sale) *GetSalesResponse {
	fullName := sale.SalespersonData.FirstName
	if sale.SalespersonData.LastName != "" {
		fullName += " " + sale.SalespersonData.LastName
	}

	return &GetSalesResponse{
		ID:            sale.SalesID,
		SalesNo:       sale.SalesNo,
		Salesperson:   fullName,
		Type:          sale.SalesType,
		Status:        sale.Status,
		Commission:    *sale.Commission,
		Date:          sale.Date,
		CustomerName:  sale.CustomerName,
		CustomerPhone: sale.CustomerPhone,
		Description:   sale.Description,
		RecordingURL:  sale.RecordingURL,
		UpdatedByName: sale.UpdatedBy,
		CreatedAt:     sale.CreatedAt,
		UpdatedAt:     sale.UpdatedAt,
	}
}

func NewGetSalesResponses(sales []*domain.Sale, totalSales int64) *GetSalesResponses {
	saleResponses := make([]GetSalesResponse, 0, len(sales))
	for _, sale := range sales {
		saleResponses = append(saleResponses, *NewGetSalesResponse(sale))
	}
	return &GetSalesResponses{
		Sales:      saleResponses,
		Total:      int64(len(saleResponses)),
		TotalSales: totalSales,
	}
}

type UpdateSaleIDRequest struct {
	ID string `uri:"id" binding:"required,uuid"`
}

type UpdateSaleRequest struct {
	ID            string    `json:"id" binding:"required,uuid"`
	Salesperson   uuid.UUID `json:"salesperson"`
	Type          string    `json:"type"`
	Status        string    `json:"status"`
	Commission    float64   `json:"commission"`
	Date          time.Time `json:"date"`
	CustomerName  string    `json:"customer_name"`
	CustomerPhone string    `json:"customer_phone"`
	Description   string    `json:"description"`
	RecordingURL  string    `json:"recording_url"`
}

type UpdateSaleResponse struct {
	ID            uuid.UUID `json:"id"`
	SalesNo       string    `json:"sales_no"`
	Salesperson   string    `json:"salesperson"`
	Type          string    `json:"type"`
	Status        string    `json:"status"`
	Commission    float64   `json:"commission"`
	Date          time.Time `json:"date"`
	CustomerName  string    `json:"customer_name"`
	CustomerPhone string    `json:"customer_phone"`
	Description   string    `json:"description"`
	RecordingURL  string    `json:"recording_url"`
	UpdatedBy     string    `json:"updated_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func NewUpdateSaleResponse(sale *domain.Sale) *UpdateSaleResponse {
	return &UpdateSaleResponse{
		ID:            sale.SalesID,
		SalesNo:       sale.SalesNo,
		Salesperson:   sale.SalespersonData.FirstName + " " + sale.SalespersonData.LastName,
		Type:          sale.SalesType,
		Status:        sale.Status,
		Commission:    *sale.Commission,
		Date:          sale.Date,
		CustomerName:  sale.CustomerName,
		CustomerPhone: sale.CustomerPhone,
		Description:   sale.Description,
		RecordingURL:  sale.RecordingURL,
		UpdatedBy:     sale.UpdatedBy,
		CreatedAt:     sale.CreatedAt,
		UpdatedAt:     sale.UpdatedAt,
	}
}

type DeleteSaleIDRequest struct {
	ID string `uri:"sale-id" binding:"required"`
}
type DeleteSaleResponse struct {
	ID uuid.UUID `json:"id"`
}

func NewDeleteSaleResponse(sale *domain.Sale) *DeleteSaleResponse {
	return &DeleteSaleResponse{
		ID: sale.SalesID,
	}
}

type GetSalesIDRequest struct {
	ID string `uri:"sale-id" binding:"required,uuid"`
}
type GetSalesByIDResponse struct {
	ID            uuid.UUID `json:"id"`
	SalesNo       string    `json:"sale_no"`
	Salesperson   string    `json:"salesperson"`
	SalespersonID uuid.UUID `json:"salesperson_id"`
	Type          string    `json:"type"`
	Status        string    `json:"status"`
	Commission    float64   `json:"commission"`
	Date          time.Time `json:"date"`
	CustomerName  string    `json:"customer_name"`
	CustomerPhone string    `json:"customer_phone"`
	Description   string    `json:"description"`
	RecordingURL  string    `json:"recording_url"`
	UpdatedBy     string    `json:"updated_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func NewGetSalesByIDResponse(sale *domain.Sale) *GetSalesByIDResponse {
	fullName := sale.SalespersonData.FirstName + " " + sale.SalespersonData.LastName

	return &GetSalesByIDResponse{
		ID:            sale.SalesID,
		SalesNo:       sale.SalesNo,
		Salesperson:   fullName,
		SalespersonID: sale.Salesperson,
		Type:          sale.SalesType,
		Status:        sale.Status,
		Commission:    *sale.Commission,
		Date:          sale.Date,
		CustomerName:  sale.CustomerName,
		CustomerPhone: sale.CustomerPhone,
		Description:   sale.Description,
		RecordingURL:  sale.RecordingURL,
		UpdatedBy:     sale.User.FirstName + " " + sale.User.LastName,
		CreatedAt:     sale.CreatedAt,
		UpdatedAt:     sale.UpdatedAt,
	}
}

type GetSalesNoResponse struct {
	ID      uuid.UUID `json:"id"`
	SalesNo string    `json:"sale_no"`
}
type GetSalesNoListResponse struct {
	Sales []GetSalesNoResponse `json:"sales"`
}

func NewGetSalesNoResponse(sale *domain.Sale) *GetSalesNoResponse {
	return &GetSalesNoResponse{
		ID:      sale.SalesID,
		SalesNo: sale.SalesNo,
	}
}

func NewGetSalesNoListResponse(sales []*domain.Sale) *GetSalesNoListResponse {
	saleListResponses := make([]GetSalesNoResponse, 0, len(sales))

	for _, sale := range sales {
		saleListResponses = append(saleListResponses, *NewGetSalesNoResponse(sale))
	}

	return &GetSalesNoListResponse{
		Sales: saleListResponses,
	}
}

// Salesperson DTOs
type CreateSalespersonRequest struct {
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	PhoneNo   string `json:"phone" binding:"required"`
	CreatedBy string `json:"created_by"`
	Status    string `json:"status"`
}

type CreateSalespersonResponse struct {
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	PhoneNo   string    `json:"phone"`
	CreatedBy string    `json:"created_by"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func NewCreateSalespersonResponse(salesperson *domain.Salesperson) *CreateSalespersonResponse {
	return &CreateSalespersonResponse{
		ID:        salesperson.ID,
		FirstName: salesperson.FirstName,
		LastName:  salesperson.LastName,
		Email:     salesperson.Email,
		PhoneNo:   salesperson.PhoneNo,
		Status:    salesperson.Status,
		CreatedBy: salesperson.CreatedBy,
		CreatedAt: salesperson.CreatedAt,
		UpdatedAt: salesperson.UpdatedAt,
	}
}

type GetSalespersonRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type GetSalespersonResponse struct {
	ID              uuid.UUID `json:"id"`
	FirstName       string    `json:"first_name"`
	LastName        string    `json:"last_name"`
	Email           string    `json:"email"`
	PhoneNo         string    `json:"phone_no"`
	TotalSalesNo    int       `json:"total_sales_no"`
	TotalCommission float64   `json:"total_commission"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `josn:"updated_at"`
}
type GetSalespersonsResponse struct {
	Salespersons      []GetSalespersonResponse `json:"salespersons"`
	Total             int64                    `json:"total"`
	TotalSalespersons int64                    `josn:"total_salespersons"`
}

func NewGetSalespersonResponse(salesperson *domain.Salesperson, totalSalesNo int, totalCommission float64) *GetSalespersonResponse {
	return &GetSalespersonResponse{
		ID:              salesperson.ID,
		FirstName:       salesperson.FirstName,
		LastName:        salesperson.LastName,
		Email:           salesperson.Email,
		PhoneNo:         salesperson.PhoneNo,
		TotalSalesNo:    totalSalesNo,
		TotalCommission: totalCommission,
		Status:          salesperson.Status,
		CreatedAt:       salesperson.CreatedAt,
		UpdatedAt:       salesperson.UpdatedAt,
	}
}

func NewGetSalespersonsResponse(
	salespersons []*domain.Salesperson,
	totalSales []int,
	totalCommission []float64,
	totalSalespersons int64,
) *GetSalespersonsResponse {
	salespersonsResponse := make([]GetSalespersonResponse, 0, len(salespersons))
	for i, salesperson := range salespersons {
		ts := 0
		tc := 0.0
		if i < len(totalSales) {
			ts = totalSales[i]
		}
		if i < len(totalCommission) {
			tc = totalCommission[i]
		}
		salespersonsResponse = append(salespersonsResponse, GetSalespersonResponse{
			ID:              salesperson.ID,
			FirstName:       salesperson.FirstName,
			LastName:        salesperson.LastName,
			Email:           salesperson.Email,
			PhoneNo:         salesperson.PhoneNo,
			TotalSalesNo:    ts,
			TotalCommission: tc,
			Status:          salesperson.Status,
			CreatedAt:       salesperson.CreatedAt,
			UpdatedAt:       salesperson.UpdatedAt,
		})
	}

	return &GetSalespersonsResponse{
		Salespersons:      salespersonsResponse,
		Total:             int64(len(salespersons)),
		TotalSalespersons: totalSalespersons,
	}
}

type UpdateSalespersonRequest struct {
	ID        string `json:"id" binding:"required,uuid"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Status    string `json:"status"`
	PhoneNo   string `json:"phone_no"`
}

type UpdateSalespersonResponse struct {
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Email     string    `json:"email"`
	PhoneNo   string    `json:"phone"`
	Status    string    `json:"status"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func NewUpdateSalespersonResponse(salesperson *domain.Salesperson) *UpdateSalespersonResponse {
	return &UpdateSalespersonResponse{
		ID:        salesperson.ID,
		FirstName: salesperson.FirstName,
		LastName:  salesperson.LastName,
		Email:     salesperson.Email,
		PhoneNo:   salesperson.PhoneNo,
		Status:    salesperson.Status,
		CreatedBy: salesperson.User.FirstName + " " + salesperson.User.LastName,
		CreatedAt: salesperson.CreatedAt,
		UpdatedAt: salesperson.UpdatedAt,
	}
}

type DeleteSalespersonIDRequest struct {
	ID string `uri:"salesperson-id" binding:"required"`
}
type DeleteSalespersonResponse struct {
	ID uuid.UUID `json:"id"`
}

func NewDeleteSalespersonResponse(salesperson *domain.Salesperson) *DeleteSalespersonResponse {
	return &DeleteSalespersonResponse{
		ID: salesperson.ID,
	}
}

type GetSalespersonIDRequest struct {
	ID string `uri:"salesperson-id" binding:"required,uuid"`
}

type GetSalespersonIDResponse struct {
	ID                      uuid.UUID `json:"id"`
	FirstName               string    `json:"first_name"`
	LastName                string    `json:"last_name"`
	Email                   string    `json:"email"`
	PhoneNo                 string    `json:"phone"`
	TotalSalesNoLastMoth    int       `json:"total_sales_no_last_month"`
	TotalCommissionLastMoth float64   `json:"total_commission_last_month"`
	TotalSalesNo            int       `json:"total_sales_no"`
	TotalCommission         float64   `json:"total_commission"`
	CreatedBy               string    `json:"created_by"`
	CreatedAt               time.Time `json:"created_at"`
	UpdatedAt               time.Time `json:"updated_at"`
}

func NewGetSalespersonIDResponse(salesperson *domain.Salesperson, totalSalesNoLastMoth int, totalCommissionLastMoth float64, totalSalesNo int, totalCommission float64) *GetSalespersonIDResponse {
	return &GetSalespersonIDResponse{
		ID:                      salesperson.ID,
		FirstName:               salesperson.FirstName,
		LastName:                salesperson.LastName,
		Email:                   salesperson.Email,
		PhoneNo:                 salesperson.PhoneNo,
		TotalSalesNoLastMoth:    totalSalesNoLastMoth,
		TotalCommissionLastMoth: totalCommissionLastMoth,
		TotalSalesNo:            totalSalesNo,
		TotalCommission:         totalCommission,
		CreatedBy:               salesperson.User.FirstName + " " + salesperson.User.LastName,
		CreatedAt:               salesperson.CreatedAt,
		UpdatedAt:               salesperson.UpdatedAt,
	}
}

type GetSalespersonNameRequest struct {
	Status string `form:"status" json:"status"`
}
type GetSalespersonNameResponse struct {
	ID          uuid.UUID `json:"id"`
	Salesperson string    `json:"salesperson"`
	PhoneNo     string    `json:"phone_no"`
}

type GetSalespersonListResponse struct {
	Salespersons []GetSalespersonNameResponse `json:"salespersons"`
}

func NewGetSalespersonsName(salesperson *domain.Salesperson) *GetSalespersonNameResponse {
	return &GetSalespersonNameResponse{
		ID:          salesperson.ID,
		Salesperson: salesperson.FirstName + " " + salesperson.LastName,
		PhoneNo:     salesperson.PhoneNo,
	}
}

func NewGetSalespersonsList(salespersons []*domain.Salesperson) *GetSalespersonListResponse {
	list := make([]GetSalespersonNameResponse, 0, len(salespersons))

	for _, sp := range salespersons {
		list = append(list, *NewGetSalespersonsName(sp))
	}

	return &GetSalespersonListResponse{
		Salespersons: list,
	}
}

type SalesByDateRangeRequest struct {
	SalespersonID string    `form:"salesperson_id" binding:"required"`
	StartDate     time.Time `form:"start_date" binding:"required" time_format:"2006-01-02"`
	EndDate       time.Time `form:"end_date" binding:"required" time_format:"2006-01-02"`
}

type SalesByDateRangeResponse struct {
	TotalSalesNo    int     `json:"total_sales_no"`
	TotalCommission float64 `json:"total_commission"`
}

func NewSalesByDateRangeResponse(totalSalesNo int, totalCommission float64) *SalesByDateRangeResponse {
	return &SalesByDateRangeResponse{
		TotalSalesNo:    totalSalesNo,
		TotalCommission: totalCommission,
	}
}

type CreateCallRequest struct {
	CallFlowID    string `json:"callFlowId" binding:"required"`
	CompanyID     string `json:"companyId" binding:"required"`
	CustomerCli   string `json:"customerCli" binding:"required"`
	AgentCli      string `json:"agentCli" binding:"required"`
	CallType      string `json:"callType" binding:"required"`
	Status        string `json:"status" binding:"required"`
	CallStartTime string `json:"callStartTime" binding:"required"`
	CallEndTime   string `json:"callEndTime" binding:"required"`
	RecordingURL  string `json:"recordingUrl" binding:"required"`
}

type CreateCallResponse struct {
	ID            uuid.UUID `json:"id"`
	CallFlowID    string    `json:"callFlowId"`
	CompanyID     string    `json:"companyId"`
	CustomerCli   string    `json:"customerCli"`
	AgentCli      string    `json:"agentCli"`
	CallType      string    `json:"callType"`
	Status        string    `json:"status"`
	CallStartTime string    `json:"callStartTime"`
	CallEndTime   string    `json:"callEndTime"`
	RecordingURL  string    `json:"recordingUrl"`
	CreatedAt     time.Time `json:"createdAt"`
}

func NewCreateCallResponse(call *domain.Call) *CreateCallResponse {
	return &CreateCallResponse{
		ID:            call.ID,
		CallFlowID:    call.CallFlowID,
		CompanyID:     call.CompanyID,
		CustomerCli:   call.CustomerCli,
		AgentCli:      call.AgentCli,
		CallType:      call.CallType,
		Status:        call.Status,
		CallStartTime: call.CallStartTime,
		CallEndTime:   call.CallEndTime,
		RecordingURL:  call.RecordingURL,
		CreatedAt:     call.CreatedAt,
	}
}

type GetCallRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type GetCallResponse struct {
	ID            uuid.UUID `json:"id"`
	Salesperson   string    `json:"salesperson"`
	AgentCli      string    `json:"agentCli"`
	CustomerCli   string    `json:"customerCli"`
	CallType      string    `json:"callType"`
	Status        string    `json:"status"`
	CallStartTime string    `json:"callStartTime"`
	CallEndTime   string    `json:"callEndTime"`
	RecordingURL  string    `json:"recordingUrl"`
	CreatedAt     time.Time `json:"createdAt"`
}

type GetCallsResponses struct {
	Calls      []GetCallResponse `json:"calls"`
	Total      int               `json:"total"`
	TotalCalls int               `json:"totalCalls"`
}

func NewGetCallsResponses(call []*domain.Call, totalCalls int) *GetCallsResponses {
	var callResponse []GetCallResponse

	for _, c := range call {
		callResponse = append(callResponse, GetCallResponse{
			ID:            c.ID,
			Salesperson:   c.Salesperson.FirstName + " " + c.Salesperson.LastName,
			AgentCli:      c.AgentCli,
			CustomerCli:   c.CustomerCli,
			CallType:      c.CallType,
			Status:        c.Status,
			CallStartTime: c.CallStartTime,
			CallEndTime:   c.CallEndTime,
			RecordingURL:  c.RecordingURL,
			CreatedAt:     c.CreatedAt,
		})
	}

	return &GetCallsResponses{
		Calls:      callResponse,
		Total:      len(callResponse),
		TotalCalls: totalCalls,
	}
}

type CreateSalesTarget struct {
	SalespersonID uuid.UUID `json:"salesperson_id"`
	Month         int       `json:"month"`
	Year          int       `json:"year"`
	Amount        float64   `json:"amount"`
	CreatedBy     string    `json:"created_by"`
}
type CreateSalesTargetResponse struct {
	ID          uuid.UUID `json:"id"`
	Salesperson string    `json:"salesperson"`
	CreatedBy   string    `json:"created_by"`
}

func NewCreatesalesTargetResponse(salesTarget *domain.SalesTarget) *CreateSalesTargetResponse {
	return &CreateSalesTargetResponse{
		ID:          salesTarget.ID,
		Salesperson: salesTarget.Salesperson.FirstName + " " + salesTarget.Salesperson.LastName,
		CreatedBy:   salesTarget.User.FirstName + " " + salesTarget.User.LastName,
	}
}

type SaleTargetBySalespersonResponse struct {
	ID         uuid.UUID `json:"id"`
	Month      int       `json:"month"`
	Year       int       `json:"year"`
	Target     float64   `json:"target"`
	Sale       float64   `json:"sale"`
	Commission float64   `josn:"commission"`
}

type SaleTargetsBySalespersonResponse struct {
	Targets []SaleTargetBySalespersonResponse `json:"targets"`
}

func NewSalesTargetsBySalespersonResponse(items []domain.SalesTarget) *SaleTargetsBySalespersonResponse {
	var responseTargets []SaleTargetBySalespersonResponse

	for _, item := range items {
		responseTargets = append(responseTargets, SaleTargetBySalespersonResponse{
			ID:         item.ID,
			Month:      item.Month,
			Year:       item.Year,
			Target:     item.TargetAmount,
			Sale:       item.Sale,
			Commission: item.Commission,
		})
	}

	return &SaleTargetsBySalespersonResponse{
		Targets: responseTargets,
	}
}

type DeleteSalesTargetIDRequest struct {
	ID string `uri:"id" binding:"required"`
}
type DeleteSalesTargetResponse struct {
	ID uuid.UUID `json:"id"`
}

func NewDeleteSalesTargetResponse(salesTarget *domain.SalesTarget) *DeleteSalesTargetResponse {
	return &DeleteSalesTargetResponse{
		ID: salesTarget.ID,
	}
}

type DateRangeResponse struct {
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
}

type LastMonthSalesResponse struct {
	Salesperson string  `json:"salesperson"`
	Target      float64 `json:"target"`
	Sales       float64 `json:"sale"`
}

type AllLastMonthSalesResponse struct {
	DatePeriod DateRangeResponse        `json:"date_period"`
	Data       []LastMonthSalesResponse `json:"data"`
}

type LastYearSalesResponse struct {
	Month       string  `json:"month"`
	Salesperson string  `json:"salesperson"`
	Target      float64 `json:"target"`
	Sales       float64 `json:"sales"`
}

type AllLastYearSalesResponse struct {
	DatePeriod DateRangeResponse       `json:"date_period"`
	Data       []LastYearSalesResponse `json:"data"`
}

type SalesDashboardResponse struct {
	LastMonth AllLastMonthSalesResponse `json:"last_month"`
	LastYear  AllLastYearSalesResponse  `json:"last_year"`
}

func GetSalesDashboardDataResponse(dashboard *domain.SalesDashboard) *SalesDashboardResponse {
	var lastMonthData []LastMonthSalesResponse
	for _, item := range dashboard.LastMonthData {
		lastMonthData = append(lastMonthData, LastMonthSalesResponse{
			Salesperson: item.SalespersonName,
			Target:      item.Target,
			Sales:       item.Sales,
		})
	}

	var lastYearData []LastYearSalesResponse
	for _, item := range dashboard.LastYearData {
		lastYearData = append(lastYearData, LastYearSalesResponse{
			Month:       item.MonthName,
			Salesperson: item.SalespersonName,
			Target:      item.Target,
			Sales:       item.Sales,
		})
	}

	return &SalesDashboardResponse{
		LastMonth: AllLastMonthSalesResponse{
			DatePeriod: DateRangeResponse{
				StartDate: dashboard.LastMonthDate.StartDate,
				EndDate:   dashboard.LastMonthDate.EndDate,
			},
			Data: lastMonthData,
		},
		LastYear: AllLastYearSalesResponse{
			DatePeriod: DateRangeResponse{
				StartDate: dashboard.LastYearDate.StartDate,
				EndDate:   dashboard.LastYearDate.EndDate,
			},
			Data: lastYearData,
		},
	}
}

type GetSalesBySalespersonRequest struct {
	Email string `uri:"email" binding:"required"`
}

type TotalSalesFrom1stOfMonth struct {
	TargetForMonth     float64 `json:"target"`
	TotalSalesForMonth float64 `json:"sales"`
}

type TotalSalesForMonth struct {
	Month     string  `json:"month"`
	TotalSale float64 `json:"sale"`
}

type SalesForthisMonthFrom1st struct {
	DatePeriod DateRangeResponse          `json:"date_period"`
	TotalSales []TotalSalesFrom1stOfMonth `json:"total_sales_from_1st"`
}

type TotalSalesForYear struct {
	DatePeriod        DateRangeResponse    `json:"date_period"`
	TotalSalesForSale []TotalSalesForMonth `json:"total_sales_for_12_months"`
}

type SalespersonDashboardResponse struct {
	ThisMonth SalesForthisMonthFrom1st `json:"this_month"`
	LastYear  TotalSalesForYear        `json:"last_year"`
}

// Mapper Function
func NewSalespersonDashboardResponse(dashboard *domain.SingleSalespersonDashboard) *SalespersonDashboardResponse {
	// Map This Month
	var thisMonthData []TotalSalesFrom1stOfMonth
	for _, item := range dashboard.ThisMonthData {
		thisMonthData = append(thisMonthData, TotalSalesFrom1stOfMonth{
			TargetForMonth:     item.Target,
			TotalSalesForMonth: item.Sales,
		})
	}

	// Map Last 12 Months
	var lastYearData []TotalSalesForMonth
	for _, item := range dashboard.LastYearData {
		lastYearData = append(lastYearData, TotalSalesForMonth{
			Month:     item.MonthName,
			TotalSale: item.TotalSale,
		})
	}

	return &SalespersonDashboardResponse{
		ThisMonth: SalesForthisMonthFrom1st{
			DatePeriod: DateRangeResponse{
				StartDate: dashboard.ThisMonthDate.StartDate,
				EndDate:   dashboard.ThisMonthDate.EndDate,
			},
			TotalSales: thisMonthData,
		},
		LastYear: TotalSalesForYear{
			DatePeriod: DateRangeResponse{
				StartDate: dashboard.LastYearDate.StartDate,
				EndDate:   dashboard.LastYearDate.EndDate,
			},
			TotalSalesForSale: lastYearData,
		},
	}
}
