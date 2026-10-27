package domain

import (
	"time"

	"github.com/google/uuid"
)

type Employee struct {
	ID                   uuid.UUID `json:"id" `
	User                 *User     `json:"user"`
	EmpID                string    `json:"emp_id"`
	EmpFolder            string    `json:"emp_folder"`
	Surname              string    `json:"surname"`
	FirstName            string    `json:"first_name"`
	LastName             string    `json:"last_name"`
	Phone                string    `json:"phone"`
	Email                string    `json:"email"`
	Nic                  string    `json:"nic"`
	PermanentAddress     string    `json:"permanent_address"`
	ResidentialAddress   string    `json:"residential_address"`
	State                string    `json:"state"`
	ZipCode              string    `json:"zip_code"`
	MaritalStatus        string    `json:"marital_status"`
	Gender               string    `json:"gender"`
	DateOfBirth          time.Time `json:"date_of_birth"`
	JobTitle             string    `json:"job_title"`
	Manager              string    `json:"manager"`
	EmployeeType         string    `json:"employee_type"`
	EmploymentStatus     string    `json:"employment_status"`
	HireDate             time.Time `json:"hire_date"`
	HireSource           string    `json:"hire_source"`
	WorkLocation         string    `json:"work_location"`
	Department           string    `json:"department"`
	RerNoP               string    `json:"rer_no_p"`
	RerNoO               string    `json:"rer_no_o"`
	RerNoS               string    `json:"rer_no_s"`
	RerNoC               string    `json:"rer_no_c"`
	RerNoW               string    `json:"rer_no_w"`
	RerNoA               string    `json:"rer_no_a"`
	BasicSalary          float64   `json:"basic_salary"`
	AfterPromotionSalary float64   `json:"after_promotion_salary"`
	TransportAllowance   float64   `json:"transport_allowance"`
	OtherAllowance       float64   `json:"other_allowance"`
	HasOvertime          bool      `json:"has_overtime"`
	OvertimeRate         float64   `json:"overtime_rate"`
	HasAttendance        bool      `json:"has_attendance"`
	HasPerformanceBonus  bool      `json:"has_performance_bonus"`
	SalaryPerHour        float64   `json:"salary_per_hour"`
	SalaryPerDay         float64   `json:"salary_per_day"`
	SalaryCycle          string    `json:"salery_cycle"`
	TotalSalary          float64   `json:"total_salary"`
	NoOfAnnualLeave      int       `json:"no_of_annual_leave"`
	NoOfCasualLeave      int       `json:"no_of_casual_leave"`
	NoOfSickLeave        int       `json:"no_of_sick_leave"`
	NoOfMaternityLeave   int       `json:"no_of_maternity_leave"`
	HasEpf               bool      `json:"has_epf"`
	EpfNo                string    `json:"epf_no"`
	EtfNo                string    `json:"etf_no"`
	Ol                   string    `json:"ol"`
	Loa                  string    `json:"loa"`
	IdStatus             string    `json:"id_status"`
	PersonalFile         string    `json:"personal_file"`
	BankName             string    `json:"bank_name"`
	Branch               string    `json:"branch"`
	AccountNo            string    `json:"account_no"`
	AccountHolderName    string    `json:"account_holder_name"`
	ResignationDate      time.Time `json:"resignation_date"`
	TerminationDate      time.Time `json:"termination_date"`
	Notes                string    `json:"notes"`
	CreatedBy            string    `json:"created_by"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`

	TakenAnnualLeave    int
	TakenCasualLeave    int
	TakenSickLeave      int
	TakenMaternityLeave int

	PendingLeaves  []Leave
	TakenLeaves    []Leave
	RejectedLeaves []Leave
}
