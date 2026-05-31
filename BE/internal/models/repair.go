package models

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RepairModel struct {
	ID uuid.UUID `json:"repair_id" gorm:"type:uuid;primary_key"`
	// User          *UserModel `gorm:"foreignKey:UpdatedBy;references:ClerkID" json:"user"`
	User                *UserModel  `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user,omitempty"`
	JobNo               string      `json:"job_no"`
	OrderID             uuid.UUID   `gorm:"type:uuid;not null REFERENCES orders(order_id)"`
	Order               *OrderModel `gorm:"foreignKey:OrderID;references:OrderID" json:"order"`
	Description         string      `json:"description"`
	Status              string      `gorm:"default:Drafted" json:"status"`
	DueDate             time.Time   `json:"due_date"`
	Price               float64     `json:"price"`
	CustomerName        string      `json:"customer_name"`
	CustomerPhoneNumber string      `json:"customer_phone"`
	CreatedBy           string      `gorm:"type:varchar(255);column:created_by" json:"created_by"`
	CreatedAt           time.Time   `json:"created_at"`
	UpdatedAt           time.Time   `json:"updated_at"`
}

func (r *RepairModel) BeforeCreate(_ *gorm.DB) (err error) {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	if r.Status == "" {
		r.Status = "Drafted"
	}
	return
}
func (r *RepairModel) TableName() string {
	return "repairs"
}
func (r *RepairModel) RepairToDomain() *domain.Repair {
	return r.RepairFromModelToDomain()
}
func RepairFromDomain(repair *domain.Repair) *RepairModel {
	return &RepairModel{
		ID:                  repair.ID,
		JobNo:               repair.JobNo,
		OrderID:             repair.OrderId,
		Description:         repair.Description,
		Status:              repair.Status,
		DueDate:             repair.DueDate,
		Price:               repair.Price,
		CustomerName:        repair.CustomerName,
		CustomerPhoneNumber: repair.CustomerPhone,
		CreatedBy:           repair.CreatedBy,
		CreatedAt:           repair.CreatedAt,
		UpdatedAt:           repair.UpdatedAt,
	}
}
func (r *RepairModel) RepairFromModelToDomain() *domain.Repair {
	domainRepair :=
		&domain.Repair{
			ID:            r.ID,
			JobNo:         r.JobNo,
			OrderId:       r.OrderID,
			Description:   r.Description,
			Status:        r.Status,
			DueDate:       r.DueDate,
			Price:         r.Price,
			CustomerName:  r.CustomerName,
			CustomerPhone: r.CustomerPhoneNumber,
			CreatedBy:     r.CreatedBy,
			CreatedAt:     r.CreatedAt,
			UpdatedAt:     r.UpdatedAt,
		}
	if r.User != nil {
		domainRepair.User = r.User.UserModelToDomain()
	}
	if r.Order != nil {
		domainRepair.Order = r.Order.OrderModelToDomain()
	}
	return domainRepair
}
