package models

import (
	"CoreSync-backend/internal/service/domain"
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type LeaveDates []time.Time

func (l LeaveDates) Value() (driver.Value, error) {
	if len(l) == 0 {
		return "{}", nil
	}

	var formattedDates []string
	for _, d := range l {
		formattedDates = append(formattedDates, fmt.Sprintf(`"%s"`, d.Format("2006-01-02 15:04:05-07:00")))
	}
	return "{" + strings.Join(formattedDates, ",") + "}", nil
}

func (l *LeaveDates) Scan(value interface{}) error {
	if value == nil {
		*l = LeaveDates{}
		return nil
	}

	var str string
	switch v := value.(type) {
	case []byte:
		str = string(v)
	case string:
		str = v
	case []time.Time:
		*l = v
		return nil
	default:
		return fmt.Errorf("unsupported type %T for LeaveDates", value)
	}

	if strings.HasPrefix(str, "{") && strings.HasSuffix(str, "}") {
		trimmed := str[1 : len(str)-1]
		if trimmed == "" {
			*l = LeaveDates{}
			return nil
		}

		parts := strings.Split(trimmed, ",")
		var dates []time.Time

		for _, part := range parts {
			part = strings.TCoreSyncpace(part)
			part = strings.Trim(part, `"`)

			layouts := []string{
				"2006-01-02 15:04:05.999999-07:00",
				"2006-01-02 15:04:05-07:00",
				"2006-01-02 15:04:05.999999-07",
				"2006-01-02 15:04:05-07",
				"2006-01-02 15:04:05.999999",
				"2006-01-02 15:04:05",
				"2006-01-02",
			}

			var parsedTime time.Time
			var err error
			parsed := false

			for _, layout := range layouts {
				if parsedTime, err = time.Parse(layout, part); err == nil {
					parsed = true
					break
				}
			}

			if !parsed {
				return fmt.Errorf("could not parse postgres time array element: %s", part)
			}
			dates = append(dates, parsedTime)
		}

		*l = dates
		return nil
	}

	return json.Unmarshal([]byte(str), l)
}

type LeaveModel struct {
	ID         uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	User       *UserModel     `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user"`
	Accept     *UserModel     `gorm:"foreignKey:AcceptedBy;references:ClerkID"`
	Employee   *EmployeeModel `gorm:"foreignKey:EmployeeId;references:ID" json:"employee"`
	EmployeeId uuid.UUID      `json:"employee_id"`
	Type       string         `json:"type"`
	Year       string         `json:"year"`
	Date       LeaveDates     `json:"date"`
	Reason     string         `json:"reason"`
	Proof      string         `json:"proof"`
	Status     string         `json:"status"`
	AcceptedBy *string        `json:"accepted_by"`
	Comment    string         `json:"comment"`
	CreatedBy  string         `json:"created_by"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
}

func (l *LeaveModel) BeforeCreate(_ *gorm.DB) (err error) {
	if l.ID == uuid.Nil {
		l.ID = uuid.New()
	}
	return
}

func (l *LeaveModel) TableName() string {
	return "leaves"
}

func (l *LeaveModel) LeaveModelToDomain() *domain.Leave {
	return LeaveModelToDomain(l)
}

func LeaveModelFromDomain(leave *domain.Leave) *LeaveModel {
	if leave == nil {
		return nil
	}
	var acceptedBy *string
	if leave.AcceptedBy != "" {
		acceptedBy = &leave.AcceptedBy
	}
	return &LeaveModel{
		ID:         leave.ID,
		EmployeeId: leave.EmployeeId,
		Type:       leave.Type,
		Year:       leave.Year,
		Date:       LeaveDates(leave.Date),
		Reason:     leave.Reason,
		Proof:      leave.Proof,
		Status:     leave.Status,
		Comment:    leave.Comment,
		CreatedBy:  leave.CreatedBy,
		AcceptedBy: acceptedBy,
	}
}

func LeaveModelToDomain(model *LeaveModel) *domain.Leave {
	if model == nil {
		return nil
	}

	var user *domain.User
	if model.User != nil {
		user = model.User.UserModelToDomain()
	}

	var accept *domain.User
	if model.Accept != nil {
		accept = model.Accept.UserModelToDomain()
	}

	var employee *domain.Employee
	if model.Employee != nil {
		employee = model.Employee.EmployeeModelToDomain()
	}

	var acceptedByStr string
	if model.AcceptedBy != nil {
		acceptedByStr = *model.AcceptedBy
	}

	return &domain.Leave{
		ID:         model.ID,
		User:       user,
		Accept:     accept,
		Employee:   employee,
		EmployeeId: model.EmployeeId,
		Type:       model.Type,
		Year:       model.Year,
		Date:       []time.Time(model.Date),
		Reason:     model.Reason,
		Proof:      model.Proof,
		Status:     model.Status,
		AcceptedBy: acceptedByStr,
		Comment:    model.Comment,
		CreatedAt:  model.CreatedAt,
		CreatedBy:  model.CreatedBy,
		UpdatedAt:  model.UpdatedAt,
	}
}
