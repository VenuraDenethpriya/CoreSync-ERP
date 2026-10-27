package models

import (
	"CoreSync-backend/internal/service/domain"
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Item struct {
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	Quantity      int     `json:"quantity"`
	EstimatedCost float64 `json:"estimated_cost"`
	Supplier      string  `json:"supplier"`
	Reason        string  `json:"reason"`
}
type ItemList []Item

func (i *ItemList) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("invalid type for ItemList")
	}
	return json.Unmarshal(bytes, i)
}
func (i ItemList) Value() (driver.Value, error) {
	if i == nil {
		return nil, nil
	}
	bytes, err := json.Marshal(i)
	if err != nil {
		return nil, err
	}
	return string(bytes), nil
}

type FinanceModel struct {
	ID            uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	User          UserModel `json:"user" gorm:"foreignKey:RequestedBy;references:ClerkID"`
	PurchaseNo    string    `json:"purchase_no" gorm:"uniqueIndex"`
	Department    string    `json:"department"`
	Date          string    `json:"date"`
	Status        string    `json:"status" gorm:"default:Pending"`
	RequestedBy   string    `json:"requested_by"`
	Items         ItemList  `json:"items" gorm:"type:jsonb"`
	IsTransferred bool      `json:"is_transferred"`
	CreatedAt     time.Time `json:"created_at"`
	// CreatedBy     string    `json:"created_by"`
	UpdatedAt time.Time `json:"updated_at"`
	// UpdatedBy *string   `json:"updated_by"`
	CreatedBy string     `json:"created_by"`
	Creator   *UserModel `gorm:"foreignKey:CreatedBy;references:ClerkID"`

	UpdatedBy *string    `json:"updated_by"`
	Updater   *UserModel `gorm:"foreignKey:UpdatedBy;references:ClerkID"`
}

func (f *FinanceModel) BeforeCreate(_ *gorm.DB) (err error) {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}
	return
}

func (f *FinanceModel) TableName() string {
	return "finance"
}

func (f *FinanceModel) FinanceModelToDomain() *domain.Finance {
	return FinanceModelToDomain(f)
}

func FinanceModelFromDomain(finance *domain.Finance) *FinanceModel {
	if finance == nil {
		return nil
	}
	var items []Item
	for _, item := range finance.Items {
		items = append(items, Item{
			Name:          item.Name,
			Description:   item.Description,
			Quantity:      item.Quantity,
			EstimatedCost: item.EstimatedCost,
			Supplier:      item.Supplier,
			Reason:        item.Reason,
		})
	}
	var updatedByPtr *string
	if finance.UpdatedBy != "" {
		val := finance.UpdatedBy
		updatedByPtr = &val
	}

	financeModel := &FinanceModel{
		ID:            finance.ID,
		PurchaseNo:    finance.PurchaseNo,
		Department:    finance.Department,
		Date:          finance.Date,
		Status:        finance.Status,
		RequestedBy:   finance.RequestedBy,
		Items:         items,
		IsTransferred: finance.IsTransferred,
		CreatedBy:     finance.CreatedBy,
		UpdatedBy:     updatedByPtr,
	}
	return financeModel
}

func FinanceModelToDomain(model *FinanceModel) *domain.Finance {
	var items []domain.Item
	for _, item := range model.Items {
		items = append(items, domain.Item{
			Name:          item.Name,
			Description:   item.Description,
			Quantity:      item.Quantity,
			EstimatedCost: item.EstimatedCost,
			Supplier:      item.Supplier,
			Reason:        item.Reason,
		})
	}
	var updatedByStr string
	if model.UpdatedBy != nil {
		updatedByStr = *model.UpdatedBy
	}

	var creator *domain.User
	if model.Creator != nil {
		creator = model.Creator.UserModelToDomain()
	}

	var updater *domain.User
	if model.Updater != nil {
		updater = model.Updater.UserModelToDomain()
	}
	return &domain.Finance{
		ID:            model.ID,
		User:          model.User.UserModelToDomain(),
		PurchaseNo:    model.PurchaseNo,
		Department:    model.Department,
		Date:          model.Date,
		Status:        model.Status,
		RequestedBy:   model.RequestedBy,
		Items:         items,
		IsTransferred: model.IsTransferred,
		UpdatedBy:     updatedByStr,
		Creator:       creator,
		Updater:       updater,
		CreatedAt:     model.CreatedAt,
		CreatedBy:     model.CreatedBy,
		UpdatedAt:     model.UpdatedAt,
	}
}
