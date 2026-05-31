package dto

import (
	"time"

	"github.com/google/uuid"
)

type GetAuditLogsRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type GetAuditLogResponse struct {
	ID          uuid.UUID `json:"id"`
	StatusCode  int       `json:"status_code"`
	Action      string    `json:"action"`
	UserName    string    `json:"user"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type GetAuditLogsResponse struct {
	Total     int                   `json:"total"`
	TotalLogs int                   `json:"total_logs"`
	Logs      []GetAuditLogResponse `json:"logs"`
}

func NewGetAuditLogResponse(log *GetAuditLogResponse) *GetAuditLogResponse {
	return &GetAuditLogResponse{
		ID:          log.ID,
		StatusCode:  log.StatusCode,
		Action:      log.Action,
		UserName:    log.UserName,
		Description: log.Description,
		CreatedAt:   log.CreatedAt,
	}
}

func NewGetAuditLogsResponse(total int, logs []GetAuditLogResponse) *GetAuditLogsResponse {
	return &GetAuditLogsResponse{
		Total:     total,
		TotalLogs: len(logs),
		Logs:      logs,
	}
}

type CreateAuditLogRequest struct {
	Action      string `json:"action"`
	StatusCode  int    `json:"status_code"`
	User        string `json:"user"`
	Description string `json:"description"`
}

type CreateAuditLogResponse struct {
	ID          uuid.UUID `json:"id"`
	StatusCode  int       `json:"status_code"`
	Action      string    `json:"action"`
	UserName    string    `json:"user"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

func NewCreateAuditLogResponse(log *CreateAuditLogResponse) *CreateAuditLogResponse {
	return &CreateAuditLogResponse{
		ID:          log.ID,
		StatusCode:  log.StatusCode,
		Action:      log.Action,
		UserName:    log.UserName,
		Description: log.Description,
		CreatedAt:   log.CreatedAt,
	}
}
