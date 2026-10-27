package models

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EmployeeModel struct {
	ID                   uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	User                 UserModel `gorm:"foreignKey:CreatedBy;references:ClerkID" json:"user"`
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
	// SaleryCycle          string    `json:"salery_cycle"`
	SaleryCycle        string    `json:"salery_cycle" gorm:"column:salery_cycle"`
	TotalSalary        float64   `json:"total_salary"`
	NoOfAnnualLeave    int       `json:"no_of_annual_leave"`
	NoOfCasualLeave    int       `json:"no_of_casual_leave"`
	NoOfSickLeave      int       `json:"no_of_sick_leave"`
	NoOfMaternityLeave int       `json:"no_of_maternity_leave"`
	HasEpf             bool      `json:"has_epf"`
	EpfNo              string    `json:"epf_no"`
	EtfNo              string    `json:"etf_no"`
	Ol                 string    `json:"ol"`
	Loa                string    `json:"loa"`
	IdStatus           string    `json:"id_status"`
	PersonalFile       string    `json:"personal_file"`
	BankName           string    `json:"bank_name"`
	Branch             string    `json:"branch"`
	AccountNo          string    `json:"account_no"`
	AccountHolderName  string    `json:"account_holder_name"`
	ResignationDate    time.Time `json:"resignation_date"`
	TerminationDate    time.Time `json:"termination_date"`
	Notes              string    `json:"notes"`
	CreatedBy          string    `json:"created_by"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

func (e *EmployeeModel) BeforeCreate(_ *gorm.DB) (err error) {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	return
}
func (e *EmployeeModel) TableName() string {
	return "employees"
}
func (e *EmployeeModel) EmployeeModelToDomain() *domain.Employee {
	return EmployeeModelToDomain(e)
}
func EmployeeModelFromDomain(employee *domain.Employee) *EmployeeModel {
	if employee == nil {
		return nil
	}
	model := &EmployeeModel{
		ID:                   employee.ID,
		EmpID:                employee.EmpID,
		EmpFolder:            employee.EmpFolder,
		Surname:              employee.Surname,
		FirstName:            employee.FirstName,
		LastName:             employee.LastName,
		Phone:                employee.Phone,
		Email:                employee.Email,
		Nic:                  employee.Nic,
		PermanentAddress:     employee.PermanentAddress,
		ResidentialAddress:   employee.ResidentialAddress,
		State:                employee.State,
		ZipCode:              employee.ZipCode,
		MaritalStatus:        employee.MaritalStatus,
		Gender:               employee.Gender,
		DateOfBirth:          employee.DateOfBirth,
		JobTitle:             employee.JobTitle,
		Manager:              employee.Manager,
		EmployeeType:         employee.EmployeeType,
		EmploymentStatus:     employee.EmploymentStatus,
		HireDate:             employee.HireDate,
		HireSource:           employee.HireSource,
		WorkLocation:         employee.WorkLocation,
		Department:           employee.Department,
		RerNoP:               employee.RerNoP,
		RerNoO:               employee.RerNoO,
		RerNoS:               employee.RerNoS,
		RerNoC:               employee.RerNoC,
		RerNoW:               employee.RerNoW,
		RerNoA:               employee.RerNoA,
		BasicSalary:          employee.BasicSalary,
		AfterPromotionSalary: employee.AfterPromotionSalary,
		TransportAllowance:   employee.TransportAllowance,
		OtherAllowance:       employee.OtherAllowance,
		HasOvertime:          employee.HasOvertime,
		OvertimeRate:         employee.OvertimeRate,
		HasAttendance:        employee.HasAttendance,
		HasPerformanceBonus:  employee.HasPerformanceBonus,
		SalaryPerHour:        employee.SalaryPerHour,
		SalaryPerDay:         employee.SalaryPerDay,
		SaleryCycle:          employee.SalaryCycle,
		TotalSalary:          employee.TotalSalary,
		NoOfAnnualLeave:      employee.NoOfAnnualLeave,
		NoOfCasualLeave:      employee.NoOfCasualLeave,
		NoOfSickLeave:        employee.NoOfSickLeave,
		NoOfMaternityLeave:   employee.NoOfMaternityLeave,
		HasEpf:               employee.HasEpf,
		EpfNo:                employee.EpfNo,
		EtfNo:                employee.EtfNo,
		Ol:                   employee.Ol,
		Loa:                  employee.Loa,
		IdStatus:             employee.IdStatus,
		PersonalFile:         employee.PersonalFile,
		BankName:             employee.BankName,
		Branch:               employee.Branch,
		AccountNo:            employee.AccountNo,
		AccountHolderName:    employee.AccountHolderName,
		ResignationDate:      employee.ResignationDate,
		TerminationDate:      employee.TerminationDate,
		Notes:                employee.Notes,
		CreatedBy:            employee.CreatedBy,
	}
	return model
}
func EmployeeModelToDomain(model *EmployeeModel) *domain.Employee {
	employee := &domain.Employee{
		ID:                   model.ID,
		EmpID:                model.EmpID,
		EmpFolder:            model.EmpFolder,
		Surname:              model.Surname,
		FirstName:            model.FirstName,
		LastName:             model.LastName,
		Phone:                model.Phone,
		Email:                model.Email,
		Nic:                  model.Nic,
		PermanentAddress:     model.PermanentAddress,
		ResidentialAddress:   model.ResidentialAddress,
		State:                model.State,
		ZipCode:              model.ZipCode,
		MaritalStatus:        model.MaritalStatus,
		Gender:               model.Gender,
		DateOfBirth:          model.DateOfBirth,
		JobTitle:             model.JobTitle,
		Manager:              model.Manager,
		EmployeeType:         model.EmployeeType,
		EmploymentStatus:     model.EmploymentStatus,
		HireDate:             model.HireDate,
		HireSource:           model.HireSource,
		WorkLocation:         model.WorkLocation,
		Department:           model.Department,
		RerNoP:               model.RerNoP,
		RerNoO:               model.RerNoO,
		RerNoS:               model.RerNoS,
		RerNoC:               model.RerNoC,
		RerNoW:               model.RerNoW,
		RerNoA:               model.RerNoA,
		BasicSalary:          model.BasicSalary,
		AfterPromotionSalary: model.AfterPromotionSalary,
		TransportAllowance:   model.TransportAllowance,
		OtherAllowance:       model.OtherAllowance,
		HasOvertime:          model.HasOvertime,
		OvertimeRate:         model.OvertimeRate,
		HasAttendance:        model.HasAttendance,
		HasPerformanceBonus:  model.HasPerformanceBonus,
		SalaryPerHour:        model.SalaryPerHour,
		SalaryPerDay:         model.SalaryPerDay,
		SalaryCycle:          model.SaleryCycle,
		TotalSalary:          model.TotalSalary,
		NoOfAnnualLeave:      model.NoOfAnnualLeave,
		NoOfCasualLeave:      model.NoOfCasualLeave,
		NoOfSickLeave:        model.NoOfSickLeave,
		NoOfMaternityLeave:   model.NoOfMaternityLeave,
		HasEpf:               model.HasEpf,
		EpfNo:                model.EpfNo,
		EtfNo:                model.EtfNo,
		Ol:                   model.Ol,
		Loa:                  model.Loa,
		IdStatus:             model.IdStatus,
		PersonalFile:         model.PersonalFile,
		BankName:             model.BankName,
		Branch:               model.Branch,
		AccountNo:            model.AccountNo,
		AccountHolderName:    model.AccountHolderName,
		ResignationDate:      model.ResignationDate,
		TerminationDate:      model.TerminationDate,
		Notes:                model.Notes,
		CreatedBy:            model.CreatedBy,
		CreatedAt:            model.CreatedAt,
		UpdatedAt:            model.UpdatedAt,
	}
	if model.User.ID != uuid.Nil {
		employee.User = model.User.UserModelToDomain()
	}
	return employee
}
