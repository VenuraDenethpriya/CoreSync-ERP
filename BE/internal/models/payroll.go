package models

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PayrollModel struct {
	ID                   uuid.UUID      `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	User                 *UserModel     `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user"`
	Employee             *EmployeeModel `gorm:"foreignKey:EmployeeId;references:ID" json:"employee"`
	Month                string         `json:"month"`
	PayrollPeriod        string         `json:"payroll_period"`
	EmployeeId           uuid.UUID      `json:"employee_id"`
	WorkingDays          int            `json:"working_days"`
	LeaveEligible        int            `json:"leave_eligible"`
	LeaveUtilized        int            `json:"leave_utilized"`
	LeaveBalance         int            `json:"leave_balance"`
	UnpaidLeave          int            `json:"unpaid_leave"`
	AttendanceIncentive  float64        `json:"attendance_incentive"`
	PerformanceIncentive float64        `json:"performance_incentive"`
	OvertimeRate         float64        `json:"overtime_rate"`
	Overtime             string         `json:"overtime"`
	OvertimeEarnings     float64        `json:"overtime_earnings"`
	TravelAllowance      float64        `json:"travel_allowance"`
	OtherAllowance       float64        `json:"other_allowance"`
	SalesCommission      float64        `json:"sales_commission"`
	Expense              float64        `json:"expense"`
	GrossSalary          float64        `json:"gross_salary"`
	Epf_8                float64        `json:"epf_8"`
	Epf_15               float64        `json:"epf_15"`
	SalaryAdvances       float64        `json:"salary_advances"`
	LeaveDeduction       float64        `json:"leave_deduction"`
	LateAttendence       float64        `json:"late_attendence"`
	Other                float64        `json:"other"`
	WaterBill            float64        `json:"water_bill"`
	NetSalary            float64        `json:"net_salary"`
	PaymentMethod        string         `json:"payment_method"`
	PaymentDate          time.Time      `json:"payment_date"`
	CreatedBy            string         `json:"created_by"`
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
}

func (p *PayrollModel) BeforeCreate(_ *gorm.DB) (err error) {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return
}

func (p *PayrollModel) TableName() string {
	return "payroll"
}

func (p *PayrollModel) PayrollModelToDomain() *domain.Payroll {
	return PayrollModelToDomain(p)
}

func PayrollModelFromDomain(payroll *domain.Payroll) *PayrollModel {
	if payroll == nil {
		return nil
	}
	var createdBy string
	if payroll.CreatedBy != "" {
		createdBy = payroll.CreatedBy
	}
	return &PayrollModel{
		ID:                   payroll.ID,
		EmployeeId:           payroll.EmployeeId,
		Month:                payroll.Month,
		PayrollPeriod:        payroll.PayrollPeriod,
		WorkingDays:          payroll.WorkingDays,
		LeaveEligible:        payroll.LeaveEligible,
		LeaveUtilized:        payroll.LeaveUtilized,
		LeaveBalance:         payroll.LeaveBalance,
		UnpaidLeave:          payroll.UnpaidLeave,
		AttendanceIncentive:  payroll.AttendanceIncentive,
		PerformanceIncentive: payroll.PerformanceIncentive,
		OvertimeRate:         payroll.OvertimeRate,
		Overtime:             payroll.Overtime,
		OvertimeEarnings:     payroll.OvertimeEarnings,
		TravelAllowance:      payroll.TravelAllowance,
		OtherAllowance:       payroll.OtherAllowance,
		SalesCommission:      payroll.SalesCommission,
		Expense:              payroll.Expense,
		GrossSalary:          payroll.GrossSalary,
		Epf_8:                payroll.Epf_8,
		Epf_15:               payroll.Epf_15,
		SalaryAdvances:       payroll.SalaryAdvances,
		LeaveDeduction:       payroll.LeaveDeduction,
		LateAttendence:       payroll.LateAttendence,
		Other:                payroll.Other,
		WaterBill:            payroll.WaterBill,
		NetSalary:            payroll.NetSalary,
		PaymentMethod:        payroll.PaymentMethod,
		PaymentDate:          payroll.PaymentDate,
		CreatedBy:            createdBy,
	}
}

func PayrollModelToDomain(model *PayrollModel) *domain.Payroll {
	if model == nil {
		return nil
	}

	var user *domain.User
	if model.User != nil {
		user = model.User.UserModelToDomain()
	}

	var employee *domain.Employee
	if model.Employee != nil {
		employee = model.Employee.EmployeeModelToDomain()
	}

	var createdByStr string
	if model.CreatedBy != "" {
		createdByStr = model.CreatedBy
	}

	return &domain.Payroll{
		ID:                   model.ID,
		User:                 user,
		Employee:             employee,
		EmployeeId:           model.EmployeeId,
		Month:                model.Month,
		PayrollPeriod:        model.PayrollPeriod,
		WorkingDays:          model.WorkingDays,
		LeaveEligible:        model.LeaveEligible,
		LeaveUtilized:        model.LeaveUtilized,
		LeaveBalance:         model.LeaveBalance,
		UnpaidLeave:          model.UnpaidLeave,
		AttendanceIncentive:  model.AttendanceIncentive,
		PerformanceIncentive: model.PerformanceIncentive,
		OvertimeRate:         model.OvertimeRate,
		Overtime:             model.Overtime,
		OvertimeEarnings:     model.OvertimeEarnings,
		TravelAllowance:      model.TravelAllowance,
		OtherAllowance:       model.OtherAllowance,
		SalesCommission:      model.SalesCommission,
		Expense:              model.Expense,
		GrossSalary:          model.GrossSalary,
		Epf_8:                model.Epf_8,
		Epf_15:               model.Epf_15,
		SalaryAdvances:       model.SalaryAdvances,
		LeaveDeduction:       model.LeaveDeduction,
		LateAttendence:       model.LateAttendence,
		Other:                model.Other,
		WaterBill:            model.WaterBill,
		NetSalary:            model.NetSalary,
		PaymentMethod:        model.PaymentMethod,
		PaymentDate:          model.PaymentDate,
		CreatedAt:            model.CreatedAt,
		CreatedBy:            createdByStr,
		UpdatedAt:            model.UpdatedAt,
	}
}
