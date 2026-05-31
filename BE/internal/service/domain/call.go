package domain

import (
	"time"

	"github.com/google/uuid"
)

type Call struct {
	ID            uuid.UUID    `json:"id"`
	Salesperson   *Salesperson `json:"salesperson"`
	CallFlowID    string       `json:"call_flow_id"`
	CompanyID     string       `json:"company_id"`
	CustomerCli   string       `json:"customer_cli"`
	AgentCli      string       `json:"agent_cli"`
	CallType      string       `json:"call_type"`
	Status        string       `json:"status"`
	CallStartTime string       `json:"call_start_time"`
	CallEndTime   string       `json:"call_end_time"`
	RecordingURL  string       `json:"recording_url"`
	CreatedAt     time.Time    `json:"created_at"`
}
