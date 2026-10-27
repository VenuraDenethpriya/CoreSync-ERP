package models

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type SiteModel struct {
	ID       uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	OrderID  uuid.UUID  `gorm:"type:uuid;not null" json:"order_id"`
	Order    OrderModel `gorm:"foreignKey:OrderID;references:OrderID" json:"order"`
	Location string     `gorm:"type:varchar(100)" json:"location,omitempty"`

	// Assignee []string `gorm:"type:text[]" json:"assignee,omitempty"`
	Assignee pq.StringArray `gorm:"type:text[]" json:"assignee,omitempty"`

	Date        time.Time `gorm:"type:date" json:"date"`
	StartTime   string    `gorm:"type:time" json:"start_time"`
	EndTime     string    `gorm:"type:time" json:"end_time"`
	Capacity    float64   `gorm:"type:numeric" json:"capacity,omitempty"`
	SolarType   string    `gorm:"type:varchar(100)" json:"solar_type,omitempty"`
	PanelType   string    `gorm:"type:varchar(100)" json:"panel_type,omitempty"`
	Inverter    string    `gorm:"type:varchar(100)" json:"inverter,omitempty"`
	Status      string    `gorm:"type:varchar(100)" json:"status,omitempty"`
	Description string    `gorm:"type:varchar(255)" json:"description,omitempty"`
	CreatedBy   string    `gorm:"type:varchar(100)" json:"created_by"`
	User        UserModel `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (s *SiteModel) BeforeCreate(_ *gorm.DB) (err error) {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return
}
func (s *SiteModel) TableName() string {
	return "sites"
}
func (s *SiteModel) SiteModelToDomain() *domain.Site {
	return SiteModelToDomain(s)
}
func SiteModelFromDomain(site *domain.Site) *SiteModel {
	if site == nil {
		return nil
	}
	siteModel := &SiteModel{
		ID:          site.ID,
		OrderID:     site.OrderID,
		Location:    site.Location,
		Assignee:    site.Assignee,
		Date:        site.Date,
		StartTime:   site.StartTime,
		EndTime:     site.EndTime,
		Capacity:    site.Capacity,
		SolarType:   site.SolarType,
		PanelType:   site.PanelType,
		Inverter:    site.Inverter,
		Status:      site.Status,
		Description: site.Description,
		CreatedBy:   site.CreatedBy,
	}
	return siteModel
}
func SiteModelToDomain(model *SiteModel) *domain.Site {
	site := &domain.Site{
		ID:          model.ID,
		OrderID:     model.OrderID,
		Location:    model.Location,
		Assignee:    model.Assignee,
		Date:        model.Date,
		StartTime:   model.StartTime,
		EndTime:     model.EndTime,
		Capacity:    model.Capacity,
		SolarType:   model.SolarType,
		PanelType:   model.PanelType,
		Inverter:    model.Inverter,
		Description: model.Description,
		Status:      model.Status,
		CreatedBy:   model.CreatedBy,
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   model.UpdatedAt,
	}

	if model.Order.OrderID != uuid.Nil {
		site.Order = OrderModelToDomain(&model.Order)
	}

	if model.User.ID != uuid.Nil {
		site.User = model.User.UserModelToDomain()
	}

	return site
}
