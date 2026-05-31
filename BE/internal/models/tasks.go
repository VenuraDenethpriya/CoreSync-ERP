package models

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"

	"gorm.io/gorm"
)

type TaskModel struct {
	ID uuid.UUID `gorm:"primaryKey;autoIncrement" json:"id"`
	// OrderId     uuid.UUID  `gorm:"foreignKey:OrderId;references:OrderID" json:"order_id"`
	OrderId uuid.UUID   `gorm:"type:uuid" json:"order_id"`
	JobId   *uuid.UUID  `gorm:"type:uuid" json:"job_id"`
	User    UserModel   `gorm:"foreignKey:Assignee;references:ClerkID" json:"users"`
	Order   OrderModel  `gorm:"foreignKey:OrderId;references:OrderID"`
	Repair  RepairModel `gorm:"foreignKey:JobId;references:ID"`
	// OrderItems []OrderItemModel `gorm:"foreignKey:OrderId;references:OrderNo"`
	OrderItems []OrderItemModel `gorm:"foreignKey:OrderNo;references:OrderId"`
	// Order       OrderModel `gorm:"foreignKey:OrderID"`
	Task           string    `json:"task"`
	Date           time.Time `json:"date"`
	Time           string    `json:"time" gorm:"type:varchar(255)"`
	Status         string    `json:"status" gorm:"default:'To Do'"`
	Assignee       string    `json:"assignee"`
	AssigneeUser   UserModel `gorm:"foreignKey:Assignee;references:ClerkID"`
	Supervisor     string    `json:"supervisor"`
	SupervisorUser UserModel `gorm:"foreignKey:Supervisor;references:ClerkID"`
	// Assignee       string    `gorm:"foreignKey:Assignee;references:ClerkID" json:"assignee"`
	// Supervisor     string    `gorm:"foreignKey:Supervisor;references:ClerkID" json:"supervisor"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (t *TaskModel) BeforeCreate(_ *gorm.DB) (err error) {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return
}

func (t *TaskModel) TableName() string {
	return "tasks"
}

func (t *TaskModel) TaskToDomain() *domain.Task {
	return t.TaskFromModelToDomain()
}

func TaskFromDomain(task *domain.Task) *TaskModel {
	var jobIdPtr *uuid.UUID
	if task.JobId != uuid.Nil {
		jobIdPtr = &task.JobId
	}
	return &TaskModel{
		ID:          task.ID,
		OrderId:     task.OrderId,
		JobId:       jobIdPtr,
		Task:        task.Task,
		Date:        task.Date,
		Time:        task.Time,
		Status:      task.Status,
		Assignee:    task.Assignee,
		Supervisor:  task.Supervisor,
		Description: task.Description,
		CreatedAt:   task.CreatedAt,
		UpdatedAt:   task.UpdatedAt,
	}
}

func (t *TaskModel) TaskFromModelToDomain() *domain.Task {
	var orderItems []*domain.OrderItem
	var orderNo string
	var orderType string
	var domainJobId uuid.UUID
	var jobNo string

	if t.Order.OrderID != uuid.Nil {
		orderNo = t.Order.OrderNo
		orderType = t.Order.Type

		if t.Order.OrderItems != nil {
			for _, item := range t.Order.OrderItems {
				if domainItem := item.OrderItemModelToDomain(); domainItem != nil {
					orderItems = append(orderItems, domainItem)
				}
			}
		}
	}

	if t.JobId != nil {
		domainJobId = *t.JobId
		jobNo = t.Repair.JobNo
	}
	return &domain.Task{
		ID:             t.ID,
		OrderItems:     orderItems,
		OrderId:        t.OrderId,
		JobId:          domainJobId,
		JobNo:          jobNo,
		OrderNo:        orderNo,
		OrderType:      orderType,
		User:           t.User.UserModelToDomain(),
		AssigneeUser:   t.AssigneeUser.UserModelToDomain(),
		SupervisorUser: t.SupervisorUser.UserModelToDomain(),
		// OrderNo:        t.Order.OrderNo,
		// OrderType:      t.Order.Type,
		Task:        t.Task,
		Date:        t.Date,
		Time:        t.Time,
		Status:      t.Status,
		Assignee:    t.Assignee,
		Supervisor:  t.Supervisor,
		Description: t.Description,
		CreatedAt:   t.CreatedAt,
		UpdatedAt:   t.UpdatedAt,
	}
}
