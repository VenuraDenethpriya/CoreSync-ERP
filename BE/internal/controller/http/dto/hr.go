package dto

import (
	"CoreSync-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
)

type CreateTalentPoolRequest struct {
	CandidateName     string    `json:"candidate_name"`
	Phone             string    `json:"phone"`
	Email             string    `json:"email"`
	DateOfApplication time.Time `json:"date_of_application"`
	PositionApplied   string    `json:"position_applied"`
	EvaluationScore   int       `json:"evaluation_score"`
	Resume            string    `json:"resume"`
	Comments          string    `json:"comments"`
	CreatedBy         string    `json:"created_by"`
}

type CreateTalentPoolResponse struct {
	ID            uuid.UUID `json:"id"`
	CandidateName string    `json:"candiate_name"`
	CreatedBy     string    `json:"created_by"`
}

func NewCreateTalentPoolResponse(talentPool *domain.TalentPool) *CreateTalentPoolResponse {
	createdByStr := talentPool.CreatedBy
	if talentPool.User != nil {
		createdByStr = talentPool.User.FirstName + " " + talentPool.User.LastName
	}
	return &CreateTalentPoolResponse{
		ID:            talentPool.ID,
		CandidateName: talentPool.CandidateName,
		CreatedBy:     createdByStr,
	}
}

type GetTalentPoolRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type GetTalentPoolResponse struct {
	ID                uuid.UUID `json:"id"`
	CandidateName     string    `json:"candidate_name"`
	Phone             string    `json:"phone"`
	Email             string    `json:"email"`
	DateOfApplication time.Time `json:"date_of_application"`
	PositionApplied   string    `json:"position_applied"`
	EvaluationScore   int       `json:"evaluation_score"`
	Status            string    `json:"status"`
	Comments          string    `json:"comments"`
	CreatedAt         time.Time `json:"created_at"`
}

type GetTalentPoolsResponse struct {
	TalentPool      []GetTalentPoolResponse `json:"talent_pool"`
	Total           int                     `json:"total"`
	TotalTalentPool int                     `json:"total_talent_pool"`
}

func NewGetTalentPoolsResponse(talentPool []*domain.TalentPool, totalTalentPool int) *GetTalentPoolsResponse {
	responses := make([]GetTalentPoolResponse, 0, len(talentPool))
	for _, tp := range talentPool {
		response := GetTalentPoolResponse{
			ID:                tp.ID,
			CandidateName:     tp.CandidateName,
			Phone:             tp.Phone,
			Email:             tp.Email,
			DateOfApplication: tp.DateOfApplication,
			PositionApplied:   tp.PositionApplied,
			EvaluationScore:   tp.EvaluationScore,
			Status:            tp.Status,
			Comments:          tp.Comments,
			CreatedAt:         tp.CreatedAt,
		}
		responses = append(responses, response)
	}
	return &GetTalentPoolsResponse{
		TalentPool:      responses,
		Total:           len(responses),
		TotalTalentPool: totalTalentPool,
	}
}

type GetTalentPoolIdRequest struct {
	ID string `uri:"talentPoolId" json:"talentPoolId"`
}

type GetTalentPoolByIdResponse struct {
	ID                uuid.UUID `json:"id"`
	CandidateName     string    `json:"candidate_name"`
	Phone             string    `json:"phone"`
	Email             string    `json:"email"`
	DateOfApplication time.Time `json:"date_of_application"`
	PositionApplied   string    `json:"position_applied"`
	EvaluationScore   int       `json:"evaluation_score"`
	Status            string    `json:"status"`
	Comments          string    `json:"comments"`
	Resume            string    `json:"resume"`
	CreatedBy         string    `json:"created_by"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"Updated_at"`
}

func NewGetTalentPoolIdResponse(tp *domain.TalentPool) *GetTalentPoolByIdResponse {

	createdBy := tp.CreatedBy

	if tp.User != nil {
		createdBy = tp.User.FirstName + " " + tp.User.LastName
	}

	return &GetTalentPoolByIdResponse{
		ID:                tp.ID,
		CandidateName:     tp.CandidateName,
		Phone:             tp.Phone,
		Email:             tp.Email,
		DateOfApplication: tp.DateOfApplication,
		PositionApplied:   tp.PositionApplied,
		EvaluationScore:   tp.EvaluationScore,
		Status:            tp.Status,
		Comments:          tp.Comments,
		Resume:            tp.Resume,
		CreatedBy:         createdBy,
		CreatedAt:         tp.CreatedAt,
		UpdatedAt:         tp.UpdatedAt,
	}
}

type UpdateTalentPoolRequest struct {
	ID                uuid.UUID `json:"id" binding:"required"`
	Status            string    `json:"status"`
	CandidateName     string    `json:"candidate_name"`
	Phone             string    `json:"phone"`
	Email             string    `json:"email"`
	DateOfApplication time.Time `json:"date_of_application"`
	DateOfInterview   time.Time `json:"date_of_interview"`
	PositionApplied   string    `json:"position_applied"`
	EvaluationScore   int       `json:"evaluation_score"`
	InterviewScore    int       `json:"interview_score"`
	Resume            string    `json:"resume"`
	Comments          string    `json:"comments"`
}
type UpdateTalentPoolResponse struct {
	ID            uuid.UUID `json:"id" binding:"required"`
	Status        string    `json:"status"`
	CandidateName string    `json:"candidate_name"`
	Phone         string    `json:"phone"`
	Email         string    `json:"email"`
}

func NewUpdateTalentPoolResponse(talenPool *domain.TalentPool) *UpdateTalentPoolResponse {
	return &UpdateTalentPoolResponse{
		ID:            talenPool.ID,
		Status:        talenPool.Status,
		CandidateName: talenPool.CandidateName,
		Phone:         talenPool.Phone,
		Email:         talenPool.Email,
	}
}

type GetInterviewTrackerRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type GetInterviewTrackerResponse struct {
	ID              uuid.UUID `json:"id"`
	CandidateName   string    `json:"candidate_name"`
	Phone           string    `json:"phone"`
	Email           string    `json:"email"`
	PositionApplied string    `json:"position_applied"`
	DateOfInterview time.Time `json:"date_of_inverview"`
	InterviewScore  int       `json:"interview_score"`
	Status          string    `json:"status"`
	Comments        string    `json:"comments"`
	CreatedAt       time.Time `json:"created_at"`
}

type GetInterviewTrackersResponse struct {
	InterviewTracker      []GetInterviewTrackerResponse `json:"interview_tracker"`
	Total                 int                           `json:"total"`
	TotalInterviewTracker int                           `json:"total_interview_tracker"`
}

func NewGetInterviewTrackerResponse(interviewTracker []*domain.TalentPool, totalInterviewTracker int) *GetInterviewTrackersResponse {
	responses := make([]GetInterviewTrackerResponse, 0, len(interviewTracker))

	for _, tp := range interviewTracker {
		response := GetInterviewTrackerResponse{
			ID:              tp.ID,
			CandidateName:   tp.CandidateName,
			Phone:           tp.Phone,
			Email:           tp.Email,
			PositionApplied: tp.PositionApplied,
			DateOfInterview: tp.DateOfInterview,
			InterviewScore:  tp.InterviewScore,
			Status:          tp.Status,
			Comments:        tp.Comments,
			CreatedAt:       tp.CreatedAt,
		}
		responses = append(responses, response)
	}

	return &GetInterviewTrackersResponse{
		InterviewTracker:      responses,
		Total:                 len(responses),
		TotalInterviewTracker: totalInterviewTracker,
	}
}

type GetInterviewTrackerIdRequest struct {
	ID string `uri:"interviewTrackerId" json:"interviewTrackerId"`
}

type GetInterviewTrackerIdResponse struct {
	ID                uuid.UUID `json:"id"`
	CandidateName     string    `json:"candidate_name"`
	Phone             string    `json:"phone"`
	Email             string    `json:"email"`
	DateOfApplication time.Time `json:"date_of_application"`
	DateOfInterview   time.Time `json:"date_of_interview"`
	PositionApplied   string    `json:"position_applied"`
	EvaluationScore   int       `json:"evaluation_score"`
	InterviewScore    int       `json:"interview_score"`
	Status            string    `json:"status"`
	Comments          string    `json:"comments"`
	Resume            string    `json:"resume"`
	CreatedBy         string    `json:"created_by"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"Updated_at"`
}

func NewGetInterviewTrackerIdResponse(tp *domain.TalentPool) *GetInterviewTrackerIdResponse {

	createdBy := tp.CreatedBy

	if tp.User != nil {
		createdBy = tp.User.FirstName + " " + tp.User.LastName
	}

	return &GetInterviewTrackerIdResponse{
		ID:                tp.ID,
		CandidateName:     tp.CandidateName,
		Phone:             tp.Phone,
		Email:             tp.Email,
		DateOfApplication: tp.DateOfApplication,
		DateOfInterview:   tp.DateOfInterview,
		PositionApplied:   tp.PositionApplied,
		InterviewScore:    tp.InterviewScore,
		EvaluationScore:   tp.EvaluationScore,
		Status:            tp.Status,
		Comments:          tp.Comments,
		Resume:            tp.Resume,
		CreatedBy:         createdBy,
		CreatedAt:         tp.CreatedAt,
		UpdatedAt:         tp.UpdatedAt,
	}
}

type DeleteInterviewTrackerRequest struct {
	InterviewTrackerId string `uri:"id" binding:"required"`
}
type DeleteInterviewTrackerResponse struct {
	ID uuid.UUID `json:"id"`
}

func NewDeleteInterviewTrackerResponse(talentPool *domain.TalentPool) *DeleteInterviewTrackerResponse {
	return &DeleteInterviewTrackerResponse{
		ID: talentPool.ID,
	}
}

type CreateEmployeeRequest struct {
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
	SaleryCycle          string    `json:"salary_cycle"`
	TotalSalary          float64   `json:"total_salary"`
	HasEpf               bool      `json:"has_epf"`
	EpfNo                string    `json:"epf_no"`
	EtfNo                string    `json:"etf_no"`
	NoOfAnnualLeave      int       `json:"no_of_annual_leave"`
	NoOfCasualLeave      int       `json:"no_of_casual_leave"`
	NoOfSickLeave        int       `json:"no_of_sick_leave"`
	NoOfMaternity        int       `json:"no_of_maternity_leave"`
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
}
type CreateEmployeeResponse struct {
	ID        uuid.UUID `json:"id"`
	EmpID     string    `json:"emp_id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	CreatedBy string    `json:"created_by"`
}

func NewCreateEmployeeResponse(employee *domain.Employee) *CreateEmployeeResponse {
	createdByStr := employee.CreatedBy
	if employee.User != nil {
		createdByStr = employee.User.FirstName + " " + employee.User.LastName
	}
	return &CreateEmployeeResponse{
		ID:        employee.ID,
		EmpID:     employee.EmpID,
		FirstName: employee.FirstName,
		LastName:  employee.LastName,
		CreatedBy: createdByStr,
	}
}

type GetEmployeeRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}
type GetEmployeeResponse struct {
	ID        uuid.UUID `json:"id"`
	EmpID     string    `json:"emp_id"`
	EmpName   string    `json:"emp_name"`
	JobTitle  string    `json:"job_title"`
	Phone     string    `json:"phone"`
	Email     string    `json:"email"`
	Nic       string    `json:"nic"`
	CreatedAt time.Time `json:"created_at"`
}
type GetEmployeesResponse struct {
	Employees      []GetEmployeeResponse `json:"employees"`
	Total          int                   `json:"total"`
	TotalEmployees int                   `json:"total_employees"`
}

func NewGetEmployeeResponse(employee []*domain.Employee, totalEmployees int) *GetEmployeesResponse {
	var employees []GetEmployeeResponse

	for _, emp := range employee {
		empName := emp.FirstName + " " + emp.LastName
		employees = append(employees, GetEmployeeResponse{
			ID:        emp.ID,
			EmpID:     emp.EmpID,
			EmpName:   empName,
			JobTitle:  emp.JobTitle,
			Phone:     emp.Phone,
			Email:     emp.Email,
			Nic:       emp.Nic,
			CreatedAt: emp.CreatedAt,
		})
	}

	return &GetEmployeesResponse{
		Employees:      employees,
		Total:          len(employees),
		TotalEmployees: totalEmployees,
	}
}

type GetEmployeeIdRequest struct {
	ID string `uri:"employeeId" json:"employeeId"`
}
type GetEmployeeIdResponse struct {
	ID                   uuid.UUID `json:"id"`
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
	SaleryCycle          string    `json:"salery_cycle"`
	TotalSalary          float64   `json:"total_salary"`
	NoOfAnnualLeave      int       `json:"no_of_annual_leave"`
	NoOfCasualLeave      int       `json:"no_of_casual_leave"`
	NoOfSickLeave        int       `json:"no_of_sick_leave"`
	NoOfMaternity        int       `json:"no_of_maternity_leave"`
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
}

func NewGetEmployeeIdResponse(employee *domain.Employee) *GetEmployeeIdResponse {
	createdBy := employee.CreatedBy
	if employee.User != nil {
		createdBy = employee.User.FirstName + " " + employee.User.LastName
	}
	return &GetEmployeeIdResponse{
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
		NoOfMaternity:        employee.NoOfMaternityLeave,
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
		CreatedBy:            createdBy,
		CreatedAt:            employee.CreatedAt,
		UpdatedAt:            employee.UpdatedAt,
	}
}

type DeleteEmployeeRequest struct {
	EmployeeId string `uri:"employeeId" binding:"required"`
}
type DeleteEmployeeResponse struct {
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
}

func NewDeleteEmployeeResponse(employee *domain.Employee) *DeleteEmployeeResponse {
	return &DeleteEmployeeResponse{
		ID:        employee.ID,
		FirstName: employee.FirstName,
		LastName:  employee.LastName,
	}
}

type UpdateEmployeeRequest struct {
	ID                   uuid.UUID `json:"id" binding:"required"`
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
	SaleryCycle          string    `json:"salery_cycle"`
	TotalSalary          float64   `json:"total_salary"`
	NoOfAnnualLeave      int       `json:"no_of_annual_leave"`
	NoOfCasualLeave      int       `json:"no_of_casual_leave"`
	NoOfSickLeave        int       `json:"no_of_sick_leave"`
	NoOfMaternity        int       `json:"no_of_maternity_leave"`
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
}
type UpdateEmployeeResponse struct {
	ID        uuid.UUID `json:"id" binding:"required"`
	EmpID     string    `json:"emp_id"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
}

func NewUpdateEmployeeResponse(employee *domain.Employee) *UpdateEmployeeResponse {
	return &UpdateEmployeeResponse{
		ID:        employee.ID,
		EmpID:     employee.EmpID,
		FirstName: employee.FirstName,
		LastName:  employee.LastName,
	}
}

type GetMyInfoByIdRequest struct {
	Email string `uri:"email" json:"email"`
}

type LeaveDetail struct {
	Type   string      `json:"type"`
	Year   string      `json:"year"`
	Date   []time.Time `json:"date"`
	Status string      `json:"status"`
}
type RejectedLeaveDetail struct {
	Type       string      `json:"type"`
	Year       string      `json:"year"`
	Date       []time.Time `json:"date"`
	Status     string      `json:"status"`
	Comment    string      `json:"comment"`
	RejectedBy string      `json:"rejected_by"`
}
type GetMyInfoByIdResponse struct {
	ID                   uuid.UUID             `json:"id"`
	EmpID                string                `json:"emp_id"`
	Surname              string                `json:"surname"`
	FirstName            string                `json:"first_name"`
	LastName             string                `json:"last_name"`
	Phone                string                `json:"phone"`
	Email                string                `json:"email"`
	Nic                  string                `json:"nic"`
	PermanentAddress     string                `json:"permanent_address"`
	ResidentialAddress   string                `json:"residential_address"`
	State                string                `json:"state"`
	ZipCode              string                `json:"zip_code"`
	MaritalStatus        string                `json:"marital_status"`
	Gender               string                `json:"gender"`
	DateOfBirth          time.Time             `json:"date_of_birth"`
	JobTitle             string                `json:"job_title"`
	Manager              string                `json:"manager"`
	EmployeeType         string                `json:"employee_type"`
	EmploymentStatus     string                `json:"employment_status"`
	HireDate             time.Time             `json:"hire_date"`
	HireSource           string                `json:"hire_source"`
	WorkLocation         string                `json:"work_location"`
	Department           string                `json:"department"`
	BasicSalary          float64               `json:"basic_salary"`
	AfterPromotionSalary float64               `json:"after_promotion_salary"`
	TransportAllowance   float64               `json:"transport_allowance"`
	OtherAllowance       float64               `json:"other_allowance"`
	HasOvertime          bool                  `json:"has_overtime"`
	OvertimeRate         float64               `json:"overtime_rate"`
	HasAttendance        bool                  `json:"has_attendance"`
	HasPerformanceBonus  bool                  `json:"has_performance_bonus"`
	SalaryPerHour        float64               `json:"salary_per_hour"`
	SalaryPerDay         float64               `json:"salary_per_day"`
	SaleryCycle          string                `json:"salery_cycle"`
	TotalSalary          float64               `json:"total_salary"`
	NoOfAnnualLeave      int                   `json:"no_of_annual_leave"`
	TakenAnnualLeave     int                   `json:"taken_annual_leave"`
	NoOfCasualLeave      int                   `json:"no_of_casual_leave"`
	TakenCasualLeave     int                   `json:"taken_casual_leave"`
	NoOfSickLeave        int                   `json:"no_of_sick_leave"`
	TakenSickLeave       int                   `json:"taken_sick_leave"`
	NoOfMaternity        int                   `json:"no_of_maternity_leave"`
	TakenMaternityLeave  int                   `json:"taken_maternity_leave"`
	PendingLeaves        []LeaveDetail         `json:"pending_leaves"`
	TakenLeaves          []LeaveDetail         `json:"taken_leaves"`
	RejectedLeaves       []RejectedLeaveDetail `json:"rejected_leaves"`
	HasEpf               bool                  `json:"has_epf"`
	EpfNo                string                `json:"epf_no"`
	EtfNo                string                `json:"etf_no"`
	BankName             string                `json:"bank_name"`
	Branch               string                `json:"branch"`
	AccountNo            string                `json:"account_no"`
	AccountHolderName    string                `json:"account_name"`
	CreatedBy            string                `json:"created_by"`
	CreatedAt            time.Time             `json:"created_at"`
	UpdatedAt            time.Time             `json:"updated_at"`
}

func NewGetMyInfoByIdResponse(employee *domain.Employee) *GetMyInfoByIdResponse {
	createdBy := employee.CreatedBy
	if employee.User != nil {
		createdBy = employee.User.FirstName + " " + employee.User.LastName
	}

	pending := make([]LeaveDetail, 0)
	for _, l := range employee.PendingLeaves {
		pending = append(pending, LeaveDetail{Type: l.Type, Year: l.Year, Date: l.Date, Status: l.Status})
	}

	taken := make([]LeaveDetail, 0)
	for _, l := range employee.TakenLeaves {
		taken = append(taken, LeaveDetail{Type: l.Type, Year: l.Year, Date: l.Date, Status: l.Status})
	}

	rejected := make([]RejectedLeaveDetail, 0)
	for _, l := range employee.RejectedLeaves {
		rejectedByName := l.AcceptedBy
		if l.Accept != nil {
			rejectedByName = l.Accept.FirstName + " " + l.Accept.LastName
		}

		rejected = append(rejected, RejectedLeaveDetail{
			Type:       l.Type,
			Year:       l.Year,
			Date:       l.Date,
			Status:     l.Status,
			Comment:    l.Comment,
			RejectedBy: rejectedByName,
		})
	}
	return &GetMyInfoByIdResponse{
		ID:                   employee.ID,
		EmpID:                employee.EmpID,
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
		TakenAnnualLeave:     employee.TakenAnnualLeave,
		NoOfCasualLeave:      employee.NoOfCasualLeave,
		TakenCasualLeave:     employee.TakenCasualLeave,
		NoOfSickLeave:        employee.NoOfSickLeave,
		TakenSickLeave:       employee.TakenSickLeave,
		NoOfMaternity:        employee.NoOfMaternityLeave,
		TakenMaternityLeave:  employee.TakenMaternityLeave,
		PendingLeaves:        pending,
		TakenLeaves:          taken,
		RejectedLeaves:       rejected,
		HasEpf:               employee.HasEpf,
		EpfNo:                employee.EpfNo,
		EtfNo:                employee.EtfNo,
		BankName:             employee.BankName,
		Branch:               employee.Branch,
		AccountNo:            employee.AccountNo,
		AccountHolderName:    employee.AccountHolderName,
		CreatedBy:            createdBy,
		CreatedAt:            employee.CreatedAt,
		UpdatedAt:            employee.UpdatedAt,
	}
}

type CreateLeaveRequest struct {
	EmployeeId uuid.UUID   `json:"employee_id"`
	Type       string      `json:"type"`
	Year       string      `json:"year"`
	Dates      []time.Time `json:"dates"`
	Reason     string      `json:"reason"`
	Proof      string      `json:"proof"`
	CreatedBy  string      `json:"created_by"`
}
type CreateLeaveResponse struct {
	ID        uuid.UUID `json:"id"`
	CreatedBy string    `json:"created_by"`
}

func NewCreateLeaveRequestResponse(leave *domain.Leave) *CreateLeaveResponse {
	createdByStr := leave.CreatedBy
	if leave.User != nil {
		createdByStr = leave.User.FirstName + " " + leave.User.LastName
	}
	return &CreateLeaveResponse{
		ID:        leave.ID,
		CreatedBy: createdByStr,
	}
}

type GetLeaveRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}
type GetLeaveRequestResponse struct {
	ID         uuid.UUID   `json:"id"`
	EmpID      string      `json:"emp_id"`
	EmpName    string      `json:"emp_name"`
	Type       string      `json:"type"`
	Year       string      `json:"year"`
	Date       []time.Time `json:"date"`
	Reason     string      `json:"reason"`
	Proof      string      `json:"proof"`
	Status     string      `json:"status"`
	AcceptedBy string      `json:"accepted_by"`
	Comment    string      `json:"comment"`
	CreatedAt  time.Time   `json:"created_at"`
}
type GetLeaveRequestsResponse struct {
	Leaves      []GetLeaveRequestResponse `json:"leaves"`
	Total       int                       `json:"total"`
	TotalLeaves int                       `json:"total_leaves"`
}

func NewGetLeaveRequestResponse(domainLeaves []*domain.Leave, totalLeave int) *GetLeaveRequestsResponse {
	leaves := make([]GetLeaveRequestResponse, 0)

	for _, l := range domainLeaves {
		if l == nil {
			continue
		}

		empID := ""
		empName := ""
		if l.Employee != nil {
			empID = l.Employee.EmpID
			empName = l.Employee.FirstName + " " + l.Employee.LastName
		}
		acceptedBy := l.AcceptedBy
		if l.Accept != nil {
			acceptedBy = l.Accept.FirstName + " " + l.Accept.LastName
		} else if l.Status == "Pending" {
			acceptedBy = ""
		}

		leaves = append(leaves, GetLeaveRequestResponse{
			ID:         l.ID,
			EmpID:      empID,
			EmpName:    empName,
			Type:       l.Type,
			Year:       l.Year,
			Date:       l.Date,
			Reason:     l.Reason,
			Proof:      l.Proof,
			Status:     l.Status,
			AcceptedBy: acceptedBy,
			Comment:    l.Comment,
			CreatedAt:  l.CreatedAt,
		})
	}

	return &GetLeaveRequestsResponse{
		Leaves:      leaves,
		Total:       len(leaves),
		TotalLeaves: totalLeave,
	}
}

type UpdateLeaveRequest struct {
	ID         uuid.UUID   `json:"id" binding:"required"`
	EmployeeId uuid.UUID   `json:"employee_id"`
	Type       string      `json:"type"`
	Year       string      `json:"year"`
	Dates      []time.Time `json:"dates"`
	Reason     string      `json:"reason"`
	Proof      string      `json:"proof"`
	Status     string      `json:"status"`
	Comment    string      `json:"comment"`
	AcceptedBy string      `json:"accepted_by"`
}
type UpdateLeaveResponse struct {
	ID           uuid.UUID `json:"id" binding:"required"`
	EmployeeName string    `json:"employee_name"`
	AcceptedBy   string    `json:"accepted_by"`
}

func NewUpdateLeaveRequestResponse(leave *domain.Leave) *UpdateLeaveResponse {
	empName := ""
	if leave.Employee != nil {
		empName = leave.Employee.FirstName + " " + leave.Employee.LastName
	}
	acceptedBy := leave.AcceptedBy
	if leave.User != nil {
		acceptedBy = leave.User.FirstName + " " + leave.User.LastName
	}
	return &UpdateLeaveResponse{
		ID:           leave.ID,
		EmployeeName: empName,
		AcceptedBy:   acceptedBy,
	}
}

type GetPayrollEmployeeListRequest struct {
	Query       string `form:"query"`
	Limit       int    `form:"limit"`
	Offset      int    `form:"offset"`
	SalaryCycle string `form:"salary_cycle"`
}

type GetPayrollEmployeeListResponse struct {
	ID                   uuid.UUID `json:"id"`
	EmpID                string    `json:"emp_id"`
	EmpName              string    `json:"emp_name"`
	Department           string    `json:"department"`
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
	SalaryCycle          string    `json:"salary_cycle"`
	TotalSalary          float64   `json:"total_salary"`
	NoOfAnnualLeave      int       `json:"no_of_annual_leave"`
	TakenAnnualLeave     int       `json:"taken_annual_leave"`
	NoOfCasualLeave      int       `json:"no_of_casual_leave"`
	TakenCasualLeave     int       `json:"taken_casual_leave"`
	NoOfSickLeave        int       `json:"no_of_sick_leave"`
	TakenSickLeave       int       `json:"taken_sick_leave"`
	NoOfMaternity        int       `json:"no_of_maternity_leave"`
	TakenMaternity       int       `json:"taken_maternity_leave"`
	BankName             string    `json:"bank_name"`
	Branch               string    `json:"branch"`
	AccountNo            string    `json:"account_no"`
	AccountHolderName    string    `json:"account_holder_name"`
}

type GetPayrollEmployeesListResponse struct {
	Employee      []GetPayrollEmployeeListResponse `json:"employee"`
	Total         int                              `json:"total"`
	TotalEmployee int                              `json:"total_employee"`
}

func NewGetPayrollEmployeeListResponse(employees []*domain.Employee, totalEmployee int) *GetPayrollEmployeesListResponse {
	employee := make([]GetPayrollEmployeeListResponse, 0)

	for _, e := range employees {
		if e == nil {
			continue
		}

		employee = append(employee, GetPayrollEmployeeListResponse{
			ID:                   e.ID,
			EmpID:                e.EmpID,
			EmpName:              e.FirstName + " " + e.LastName,
			Department:           e.Department,
			BasicSalary:          e.BasicSalary,
			AfterPromotionSalary: e.AfterPromotionSalary,
			TransportAllowance:   e.TransportAllowance,
			OtherAllowance:       e.OtherAllowance,
			HasOvertime:          e.HasOvertime,
			OvertimeRate:         e.OvertimeRate,
			HasAttendance:        e.HasAttendance,
			HasPerformanceBonus:  e.HasPerformanceBonus,
			SalaryPerHour:        e.SalaryPerHour,
			SalaryPerDay:         e.SalaryPerDay,
			SalaryCycle:          e.SalaryCycle,
			TotalSalary:          e.TotalSalary,
			NoOfAnnualLeave:      e.NoOfAnnualLeave,
			TakenAnnualLeave:     e.TakenAnnualLeave,
			NoOfCasualLeave:      e.NoOfCasualLeave,
			TakenCasualLeave:     e.TakenCasualLeave,
			NoOfSickLeave:        e.NoOfSickLeave,
			TakenSickLeave:       e.TakenSickLeave,
			NoOfMaternity:        e.NoOfMaternityLeave,
			TakenMaternity:       e.TakenMaternityLeave,
			BankName:             e.BankName,
			Branch:               e.Branch,
			AccountNo:            e.AccountNo,
			AccountHolderName:    e.AccountHolderName,
		})
	}

	return &GetPayrollEmployeesListResponse{
		Employee:      employee,
		Total:         len(employee),
		TotalEmployee: totalEmployee,
	}
}

type CreatePayrollRequest struct {
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
}

type CreatePayrollResponse struct {
	ID      uuid.UUID `json:"id"`
	EmpName string    `json:"empName"`
	Month   string    `json:"month"`
}

func GetCreatePayrollResponse(payroll *domain.Payroll) *CreatePayrollResponse {
	var employeeName string

	if payroll.Employee != nil {
		employeeName = payroll.Employee.FirstName + " " + payroll.Employee.LastName
	} else {
		employeeName = payroll.EmployeeId.String()
	}

	return &CreatePayrollResponse{
		ID:      payroll.ID,
		EmpName: employeeName,
		Month:   payroll.Month,
	}
}

type GetPayrollHistoryRequest struct {
	Query       string `form:"query"`
	Limit       int    `form:"limit"`
	Offset      int    `form:"offset"`
	SalaryCycle string `form:"salary_cycle"`
	EmployeeID  string `form:"employee_id"`
	Month       string `form:"month"`
}

type GetPayrollHistoryResponse struct {
	ID                   uuid.UUID `json:"id"`
	EmployeeID           uuid.UUID `json:"employee_id"`
	EmpID                string    `json:"emp_id"`
	EmpName              string    `json:"emp_name"`
	JobTitle             string    `json:"job_title"`
	Department           string    `json:"department"`
	Address              string    `json:"address"`
	Phone                string    `json:"phone"`
	Email                string    `json:"email"`
	Month                string    `json:"month"`
	PayrollPeriod        string    `json:"payroll_period"`
	BasicSalary          float64   `json:"basic_salary"`
	WorkingDays          int       `json:"working_days"`
	LeaveEligible        int       `json:"leave_eligible"`
	LeaveUtilized        int       `json:"leave_utilized"`
	LeaveBalance         int       `json:"leave_balance"`
	UnpaidLeave          int       `json:"unpaid_leave"`
	AttendanceIncentive  float64   `json:"attendance_incentive"`
	PerformanceIncentive float64   `json:"performance_incentive"`
	HasOvertime          bool      `json:"has_overtime"`
	OvertimeEarnings     float64   `json:"overtime_earnings"`
	OvertimeRate         float64   `json:"overtime_rate"`
	Overtime             string    `json:"overtime"`
	TravelAllowance      float64   `json:"travel_allowance"`
	OtherAllowance       float64   `json:"other_allowance"`
	SalesCommission      float64   `json:"sales_commission"`
	Expense              float64   `json:"expense"`
	GrossSalary          float64   `json:"gross_salary"`
	HasEpf               bool      `json:"has_epf"`
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
	AnnualLeaveTaken     int       `json:"annual_leave_taken"`
	AnnualLeaveBalance   int       `json:"annual_leave_balance"`
	CreatedBy            string    `json:"created_by"`
	BankName             string    `json:"bank_name"`
	Branch               string    `json:"branch"`
	AccountNo            string    `json:"account_no"`
	AccountHolderName    string    `json:"account_holder_name"`
}
type GetPayrollHistoryListResponse struct {
	Employee      []GetPayrollHistoryResponse `json:"employee"`
	Total         int                         `json:"total"`
	TotalEmployee int                         `json:"total_employee"`
}

func NewGetPayrollHistoryListResponse(payrolls []*domain.Payroll, totalEmployee int) *GetPayrollHistoryListResponse {
	if payrolls == nil {
		return nil
	}

	var employeeResponses []GetPayrollHistoryResponse

	for _, payroll := range payrolls {
		if payroll == nil {
			continue
		}

		resp := GetPayrollHistoryResponse{
			ID:                   payroll.ID,
			EmployeeID:           payroll.EmployeeId,
			Month:                payroll.Month,
			PayrollPeriod:        payroll.PayrollPeriod,
			WorkingDays:          payroll.WorkingDays,
			LeaveEligible:        payroll.LeaveEligible,
			LeaveUtilized:        payroll.LeaveUtilized,
			LeaveBalance:         payroll.LeaveBalance,
			UnpaidLeave:          payroll.UnpaidLeave,
			AttendanceIncentive:  payroll.AttendanceIncentive,
			PerformanceIncentive: payroll.PerformanceIncentive,
			OvertimeEarnings:     payroll.OvertimeEarnings,
			OvertimeRate:         payroll.OvertimeRate,
			Overtime:             payroll.Overtime,
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
			CreatedBy:            payroll.CreatedBy,
		}

		if payroll.Employee != nil {
			resp.EmpID = payroll.Employee.EmpID
			resp.EmpName = payroll.Employee.FirstName + " " + payroll.Employee.LastName
			resp.JobTitle = payroll.Employee.JobTitle
			resp.Department = payroll.Employee.Department
			resp.Address = payroll.Employee.PermanentAddress
			resp.Phone = payroll.Employee.Phone
			resp.Email = payroll.Employee.Email
			resp.BasicSalary = payroll.Employee.BasicSalary
			resp.HasOvertime = payroll.Employee.HasOvertime
			resp.HasEpf = payroll.Employee.HasEpf
			resp.AnnualLeaveTaken = payroll.Employee.TakenAnnualLeave
			resp.AnnualLeaveBalance = payroll.Employee.NoOfAnnualLeave - payroll.Employee.TakenAnnualLeave
			resp.BankName = payroll.Employee.BankName
			resp.Branch = payroll.Employee.Branch
			resp.AccountNo = payroll.Employee.AccountNo
			resp.AccountHolderName = payroll.Employee.AccountHolderName
		} else {
			resp.EmpID = payroll.EmployeeId.String()
			resp.EmpName = "Unknown Employee"
			resp.Department = "N/A"
			resp.BasicSalary = 0
		}

		employeeResponses = append(employeeResponses, resp)
	}

	return &GetPayrollHistoryListResponse{
		Employee:      employeeResponses,
		Total:         len(employeeResponses),
		TotalEmployee: totalEmployee,
	}
}

type UpdatePayrollRequest struct {
	ID                   uuid.UUID `json:"id" binding:"required"`
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
}

type UpdatePayrollResponse struct {
	ID      uuid.UUID `json:"id"`
	EmpName string    `json:"empName"`
	Month   string    `json:"month"`
}

func NewUpdatePayrollResponse(payroll *domain.Payroll) *UpdatePayrollResponse {
	var employeeName string

	if payroll.Employee != nil {
		employeeName = payroll.Employee.FirstName + " " + payroll.Employee.LastName
	} else {
		employeeName = payroll.EmployeeId.String()
	}

	return &UpdatePayrollResponse{
		ID:      payroll.ID,
		EmpName: employeeName,
		Month:   payroll.Month,
	}
}

type GetBirthdaysRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}
type GetBirthdayResponse struct {
	ID            uuid.UUID `json:"id"`
	EmpID         string    `json:"emp_id"`
	EmpName       string    `json:"emp_name"`
	Dob           time.Time `json:"dob"`
	DaysRemaining int       `json:"days_remaining"`
}
type GetBirthdaysResponse struct {
	Employees     []GetBirthdayResponse `json:"employee"`
	Total         int                   `json:"total"`
	TotalEmployee int                   `json:"total_employee"`
}

func calculateDaysRemaining(dob time.Time) int {
	if dob.IsZero() || dob.Year() < 1900 {
		return -1
	}

	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	nextBday := time.Date(now.Year(), dob.Month(), dob.Day(), 0, 0, 0, 0, now.Location())

	if nextBday.Before(today) {
		nextBday = nextBday.AddDate(1, 0, 0)
	}
	return int(nextBday.Sub(today).Hours() / 24)
}

func NewGetBirthdaysResponse(employee []*domain.Employee, totalEmployee int) *GetBirthdaysResponse {
	responses := make([]GetBirthdayResponse, 0, len(employee))
	for _, e := range employee {
		if e.DateOfBirth.Year() < 1900 {
			continue
		}

		response := GetBirthdayResponse{
			ID:            e.ID,
			EmpID:         e.EmpID,
			EmpName:       e.FirstName + " " + e.LastName,
			Dob:           e.DateOfBirth,
			DaysRemaining: calculateDaysRemaining(e.DateOfBirth),
		}
		responses = append(responses, response)
	}
	return &GetBirthdaysResponse{
		Employees:     responses,
		Total:         len(responses),
		TotalEmployee: totalEmployee,
	}
}

type DeletePayrollHistoryRequest struct {
	PayrollId string `uri:"id" binding:"required"`
}

type DeletePayrollHistoryResponse struct {
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Month     string    `json:"month"`
}

func NewDeletePayrollHistoryResponse(payroll *domain.Payroll) *DeletePayrollHistoryResponse {
	return &DeletePayrollHistoryResponse{
		ID:        payroll.ID,
		FirstName: payroll.Employee.FirstName,
		LastName:  payroll.Employee.LastName,
		Month:     payroll.Month,
	}
}
