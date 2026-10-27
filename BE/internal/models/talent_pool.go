package models

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TalentPoolModel struct {
	ID                uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	User              UserModel `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user"`
	CandidateName     string    `json:"candidate_nam"`
	Phone             string    `json:"phone"`
	Email             string    `json:"email"`
	Status            string    `json:"status" gorm:"default:Appiled"`
	DateOfApplication time.Time `json:"date_of_application"`
	DateOfInterview   time.Time `json:"date_of_interview"`
	PositionApplied   string    `json:"position"`
	EvaluationScore   int       `json:"evaluation_score"`
	InterviewScore    int       `json:"interview_score"`
	Resume            string    `json:"resume"`
	Comments          string    `json:"comments"`
	CreatedAt         time.Time `json:"created_at"`
	CreatedBy         string    `json:"created_by"`
	UpdatedAt         time.Time `json:"updated_at"`
}

func (T *TalentPoolModel) BeforeCreate(_ *gorm.DB) (err error) {
	if T.ID == uuid.Nil {
		T.ID = uuid.New()
	}
	return
}
func (T *TalentPoolModel) TableName() string {
	return "talent_pool"
}

func (T *TalentPoolModel) TalentPoolModelToDomain() *domain.TalentPool {
	return TalentPoolModelToDomain(T)
}

func TalentPoolModelFromDomain(talentPool *domain.TalentPool) *TalentPoolModel {
	if talentPool == nil {
		return nil
	}

	model := &TalentPoolModel{
		ID:                talentPool.ID,
		CandidateName:     talentPool.CandidateName,
		Phone:             talentPool.Phone,
		Email:             talentPool.Email,
		Status:            talentPool.Status,
		DateOfApplication: talentPool.DateOfApplication,
		DateOfInterview:   talentPool.DateOfInterview,
		PositionApplied:   talentPool.PositionApplied,
		EvaluationScore:   talentPool.EvaluationScore,
		InterviewScore:    talentPool.InterviewScore,
		Resume:            talentPool.Resume,
		Comments:          talentPool.Comments,
		CreatedBy:         talentPool.CreatedBy,
	}

	return model
}
func TalentPoolModelToDomain(model *TalentPoolModel) *domain.TalentPool {
	talent := &domain.TalentPool{
		ID:                model.ID,
		CandidateName:     model.CandidateName,
		Phone:             model.Phone,
		Email:             model.Email,
		Status:            model.Status,
		DateOfApplication: model.DateOfApplication,
		DateOfInterview:   model.DateOfInterview,
		PositionApplied:   model.PositionApplied,
		EvaluationScore:   model.EvaluationScore,
		InterviewScore:    model.InterviewScore,
		Resume:            model.Resume,
		Comments:          model.Comments, CreatedBy: model.CreatedBy,
	}
	if model.User.ID != uuid.Nil {
		talent.User = model.User.UserModelToDomain()
	}

	return talent
}
