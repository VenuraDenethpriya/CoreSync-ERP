package domain

import (
	"time"

	"github.com/google/uuid"
)

type TalentPool struct {
	ID                uuid.UUID `json:"id"`
	CandidateName     string    `json:"candidate_nam"`
	Phone             string    `json:"phone"`
	Email             string    `json:"email"`
	Status            string    `json:"status"`
	DateOfApplication time.Time `json:"date_of_application"`
	DateOfInterview   time.Time `json:"date_of_interview"`
	PositionApplied   string    `json:"position"`
	EvaluationScore   int       `json:"evaluation_score"`
	InterviewScore    int       `json:"interview_score"`
	Resume            string    `json:"resume"`
	Comments          string    `json:"comments"`
	User              *User     `json:"user"`
	CreatedAt         time.Time `json:"created_at"`
	CreatedBy         string    `json:"created_by"`
	UpdatedAt         time.Time `json:"updated_at"`
}
