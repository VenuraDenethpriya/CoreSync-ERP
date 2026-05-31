package models

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CallModel struct {
	ID            uuid.UUID        `json:"id" gorm:"type:uuid;primary_key"`
	Salesperson   SalespersonModel `gorm:"foreignKey:AgentCli;references:PhoneNo" json:"salesperson"`
	CallFlowID    string           `json:"call_flow_id"`
	CompanyID     string           `json:"company_id"`
	CustomerCli   string           `json:"customer_cli"`
	AgentCli      string           `json:"agent_cli"`
	CallType      string           `json:"call_type"`
	Status        string           `json:"status"`
	CallStartTime string           `json:"call_start_time"`
	CallEndTime   string           `json:"call_end_time"`
	RecordingURL  string           `json:"recording_url"`
	CreatedAt     time.Time        `json:"created_at"`
}

func (a *CallModel) BeforeCreate(_ *gorm.DB) (err error) {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return
}

func (c *CallModel) TableName() string {
	return "calls"
}
func CallFromDomain(call *domain.Call) *CallModel {
	return &CallModel{
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
func (c *CallModel) CallFromModelToDomain() *domain.Call {
	return &domain.Call{
		ID:            c.ID,
		Salesperson:   c.Salesperson.SalespersonToDomain(),
		CallFlowID:    c.CallFlowID,
		CompanyID:     c.CompanyID,
		CustomerCli:   c.CustomerCli,
		AgentCli:      c.AgentCli,
		CallType:      c.CallType,
		Status:        c.Status,
		CallStartTime: c.CallStartTime,
		CallEndTime:   c.CallEndTime,
		RecordingURL:  c.RecordingURL,
		CreatedAt:     c.CreatedAt,
	}
}
