package domain

import (
	"time"

	"github.com/google/uuid"
)

type Payroll struct {
	ID                   uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	User                 *User     `json:"user"`
	Employee             *Employee `json:"employee"`
	Month                string    `json:"month"`
	PayrollPeriod        string    `json:"payroll_period"`
	EmployeeId           uuid.UUID `json:"employee_id"`
	WorkingDays          int       `json:"working_days"`
	LeaveEligible        int       `json:"leave_eligible"`
	LeaveUtilized        int       `json:"leave_utilized"`
	LeaveBalance         int       `json:"leave_balance"`
	UnpaidLeave          int       `json:"unpaid_leave"`
	AttendanceIncentive  float64   `json:"attendance_incentive"`
	PerformanceIncentive float64   `json:"performance_incentive"`
	OvertimeEarnings     float64   `json:"overtime_earnings"`
	OvertimeRate         float64   `json:"overtime_rate"`
	Overtime             string    `json:"overtime"`
	TravelAllowance      float64   `json:"travel_allowance"`
	OtherAllowance       float64   `json:"other_allowance"`
	SalesCommission      float64   `json:"sales_commission"`
	Expense              float64   `json:"expense"`
	GrossSalary          float64   `json:"gross_salary"`
	Epf_8                float64   `json:"epf_8"`
	Epf_15               float64   `json:"epf_15"`
	SalaryAdvances       float64   `json:"salary_advances"`
	LeaveDeduction       float64   `json:"leave_deduction"`
	LateAttendence       float64   `json:"late_attendence"`
	Other                float64   `json:"other"`
	WaterBill            float64   `json:"water_bill"`
	NetSalary            float64   `json:"net_salary"`
	PaymentMethod        string    `json:"payment_method"`
	PaymentDate          time.Time `json:"payment_date"`
	CreatedBy            string    `json:"created_by"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}
