package repository

import (
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/models"
	"CoreSync-backend/internal/service/domain"
	"context"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type HrRepository struct {
	db       *gorm.DB
	userRepo UserRepositoryInterface
}

func NewHrRepository(db *gorm.DB, userRepo UserRepositoryInterface) *HrRepository {
	return &HrRepository{
		db:       db,
		userRepo: userRepo,
	}
}

func (hr *HrRepository) CreateTalentPool(ctx context.Context, talentPool *domain.TalentPool) (*domain.TalentPool, error) {
	talentPoolModel := models.TalentPoolModelFromDomain(talentPool)

	if err := hr.db.Create(talentPoolModel).Error; err != nil {
		logger.Error(ctx, "Error creating talent pool: ", zap.Error(err))
		return nil, err
	}

	logger.Info(ctx, "Talent pool created", zap.String("method", "POST"), zap.Any("talent pool", talentPoolModel))
	return talentPoolModel.TalentPoolModelToDomain(), nil
}

func (hr *HrRepository) GetTalentPools(ctx context.Context, query string, limit int, offset int) ([]*domain.TalentPool, int, error) {
	var talentPoolModels []models.TalentPoolModel
	var total int64

	dbQuery := hr.db.WithContext(ctx).Model(&models.TalentPoolModel{}).
		Where("status NOT IN ?", []string{"Screening", "Shortlisted", "Offer sent", "On-boarding"})

	if query != "" {
		searchStr := "%" + query + "%"
		dbQuery = dbQuery.Where("candidate_name ILIKE ? OR phone ILIKE ? OR status ILIKE ? OR email ILIKE ? OR position_applied ILIKE ? OR evaluation_score::text ILIKE ? OR comments ILIKE ?", searchStr, searchStr, searchStr, searchStr, searchStr, searchStr, searchStr).Preload("User")
	}

	if err := dbQuery.Count(&total).Error; err != nil {
		logger.Error(ctx, "Failed to count talent pool", zap.Error(err))
		return nil, 0, err
	}

	if limit > 0 {
		dbQuery = dbQuery.Limit(limit)
	}
	if offset > 0 {
		dbQuery = dbQuery.Offset(offset)
	}

	if err := dbQuery.Order("created_at DESC").Find(&talentPoolModels).Error; err != nil {
		logger.Error(ctx, "Failed to fetch talent pool", zap.Error(err))
		return nil, 0, err
	}

	domainTalentPool := make([]*domain.TalentPool, 0, len(talentPoolModels))
	for i := range talentPoolModels {
		domainTalentPool = append(domainTalentPool, talentPoolModels[i].TalentPoolModelToDomain())
	}

	return domainTalentPool, int(total), nil
}

func (hr *HrRepository) GetTalentPoolByID(ctx context.Context, talentPool *domain.TalentPool) (*domain.TalentPool, error) {
	var talentPoolModel models.TalentPoolModel

	err := hr.db.WithContext(ctx).
		Preload("User").
		Where("id = ?", talentPool.ID).
		First(&talentPoolModel).Error

	if err != nil {
		logger.Error(ctx, "Failed to fetch talent pool by ID", zap.Error(err))
		return nil, err
	}

	return talentPoolModel.TalentPoolModelToDomain(), nil
}

func (hr *HrRepository) UpdateTalentPool(ctx context.Context, talentPool *domain.TalentPool) (*domain.TalentPool, error) {
	var talentPoolModel models.TalentPoolModel

	err := hr.db.Where("id = ?", talentPool.ID).First(&talentPoolModel).Error
	if err != nil {
		return nil, err
	}

	talentPoolModel.CandidateName = talentPool.CandidateName
	talentPoolModel.Phone = talentPool.Phone
	talentPoolModel.Email = talentPool.Email
	talentPoolModel.Status = talentPool.Status
	talentPoolModel.DateOfApplication = talentPool.DateOfApplication
	talentPoolModel.DateOfInterview = talentPool.DateOfInterview
	talentPoolModel.PositionApplied = talentPool.PositionApplied
	talentPoolModel.EvaluationScore = talentPool.EvaluationScore
	talentPoolModel.InterviewScore = talentPool.InterviewScore
	talentPoolModel.Resume = talentPool.Resume
	talentPoolModel.Comments = talentPool.Comments
	err = hr.db.Updates(&talentPoolModel).Error
	if err != nil {
		logger.Error(ctx, "Error updating talent pool", zap.String("method", "PUT"), zap.String("path", "/hr/talent-pool/:id"), zap.Any("talent pool", talentPool), zap.Error(err))
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := hr.db.First(&userModel, "clerk_id = ?", talentPoolModel.CreatedBy).Error; err == nil {
		talentPoolModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", talentPoolModel.CreatedBy), zap.Error(err))
	}
	logger.Info(ctx, "Talent pool updated", zap.String("method", "PUT"), zap.String("path", "/hr/talent-pool/:id"), zap.Any("talent pool", talentPool))
	return talentPoolModel.TalentPoolModelToDomain(), nil
}

func (hr *HrRepository) GetInterviewTrackers(ctx context.Context, query string, limit int, offset int) ([]*domain.TalentPool, int, error) {
	var talentPoolModels []models.TalentPoolModel
	var total int64

	dbQuery := hr.db.WithContext(ctx).Model(&models.TalentPoolModel{}).
		Where("status NOT IN ?", []string{"Appiled", "Hold for Future"})

	if query != "" {
		searchStr := "%" + query + "%"
		dbQuery = dbQuery.Where("candidate_name ILIKE ? OR phone ILIKE ? OR status ILIKE ? OR email ILIKE ? OR position_applied ILIKE ? OR evaluation_score::text ILIKE ? OR comments ILIKE ?", searchStr, searchStr, searchStr, searchStr, searchStr, searchStr, searchStr).Preload("User")
	}

	if err := dbQuery.Count(&total).Error; err != nil {
		logger.Error(ctx, "Failed to count talent pool", zap.Error(err))
		return nil, 0, err
	}

	if limit > 0 {
		dbQuery = dbQuery.Limit(limit)
	}
	if offset > 0 {
		dbQuery = dbQuery.Offset(offset)
	}

	if err := dbQuery.Order("created_at DESC").Find(&talentPoolModels).Error; err != nil {
		logger.Error(ctx, "Failed to fetch interview trackers", zap.Error(err))
		return nil, 0, err
	}

	domainTalentPool := make([]*domain.TalentPool, 0, len(talentPoolModels))
	for i := range talentPoolModels {
		domainTalentPool = append(domainTalentPool, talentPoolModels[i].TalentPoolModelToDomain())
	}

	return domainTalentPool, int(total), nil
}

func (hr *HrRepository) GetInterviewTrackerByID(ctx context.Context, talentPool *domain.TalentPool) (*domain.TalentPool, error) {
	var talentPoolModel models.TalentPoolModel

	err := hr.db.WithContext(ctx).
		Preload("User").
		Where("id = ?", talentPool.ID).
		First(&talentPoolModel).Error

	if err != nil {
		logger.Error(ctx, "Failed to fetch interview tracker by ID", zap.Error(err))
		return nil, err
	}

	return talentPoolModel.TalentPoolModelToDomain(), nil
}

func (hr *HrRepository) DeleteInterviewTracker(ctx context.Context, talentPool *domain.TalentPool) (*domain.TalentPool, error) {
	var talentModel models.TalentPoolModel
	err := hr.db.First(&talentModel, "id = ?", talentPool.ID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, err
		}
		return nil, err
	}
	err = hr.db.Delete(&talentModel).Error
	if err != nil {
		logger.Error(ctx, "Error deleting interview tracker", zap.String("method", "DELETE"), zap.String("path", "/interview-tracker"), zap.Any("InterviewTrackerId", talentModel.ID), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Sale deleted", zap.String("method", "DELETE"), zap.String("path", "/interview-tracker"), zap.Any("Interview-tracker", talentModel.ID))
	return talentModel.TalentPoolModelToDomain(), nil
}

func (hr *HrRepository) CreateEmployee(ctx context.Context, employee *domain.Employee) (*domain.Employee, error) {
	employeeModel := models.EmployeeModelFromDomain(employee)

	if err := hr.db.Create(employeeModel).Error; err != nil {
		logger.Error(ctx, "Error creating employee: ", zap.Error(err))
		return nil, err
	}

	logger.Info(ctx, "Employee created", zap.String("method", "POST"), zap.Any("employee", employeeModel))
	return employeeModel.EmployeeModelToDomain(), nil
}

func (hr *HrRepository) GetEmployees(ctx context.Context, query string, limit int, offset int) ([]*domain.Employee, int, error) {
	var employeeModels []models.EmployeeModel
	var total int64

	dbQuery := hr.db.WithContext(ctx).Model(&models.EmployeeModel{})

	if query != "" {
		searchStr := "%" + query + "%"
		dbQuery = dbQuery.Where("first_name ILIKE ? OR last_name ILIKE ? OR surname ILIKE ? OR phone ILIKE ? OR email ILIKE ? OR nic ILIKE ? OR job_title ILIKE ?", searchStr, searchStr, searchStr, searchStr, searchStr, searchStr, searchStr).Preload("User")
	}

	if err := dbQuery.Count(&total).Error; err != nil {
		logger.Error(ctx, "Failed to count employees", zap.Error(err))
		return nil, 0, err
	}

	if limit > 0 {
		dbQuery = dbQuery.Limit(limit)
	}
	if offset > 0 {
		dbQuery = dbQuery.Offset(offset)
	}

	if err := dbQuery.Order("created_at DESC").Find(&employeeModels).Error; err != nil {
		logger.Error(ctx, "Failed to fetch employees", zap.Error(err))
		return nil, 0, err
	}

	domainEmployees := make([]*domain.Employee, 0, len(employeeModels))
	for i := range employeeModels {
		domainEmployees = append(domainEmployees, employeeModels[i].EmployeeModelToDomain())
	}

	return domainEmployees, int(total), nil
}

func (hr *HrRepository) GetEmployeeByID(ctx context.Context, employee *domain.Employee) (*domain.Employee, error) {
	var employeeModel models.EmployeeModel

	err := hr.db.WithContext(ctx).
		Preload("User").
		Where("id = ?", employee.ID).
		First(&employeeModel).Error

	if err != nil {
		logger.Error(ctx, "Failed to fetch employee by ID", zap.Error(err))
		return nil, err
	}

	return employeeModel.EmployeeModelToDomain(), nil
}

func (hr *HrRepository) DeleteEmployee(ctx context.Context, employee *domain.Employee) (*domain.Employee, error) {
	var employeeModel models.EmployeeModel
	err := hr.db.First(&employeeModel, "id = ?", employee.ID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, err
		}
		return nil, err
	}
	err = hr.db.Delete(&employeeModel).Error
	if err != nil {
		logger.Error(ctx, "Error deleting employee", zap.String("method", "DELETE"), zap.String("path", "/employee"), zap.Any("EmployeeId", employeeModel.ID), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Employee deleted", zap.String("method", "DELETE"), zap.String("path", "/employee"), zap.Any("EmployeeId", employeeModel.ID))
	return employeeModel.EmployeeModelToDomain(), nil
}

func (hr *HrRepository) UpdateEmployee(ctx context.Context, employee *domain.Employee) (*domain.Employee, error) {
	var employeeModel models.EmployeeModel

	err := hr.db.Where("id = ?", employee.ID).First(&employeeModel).Error
	if err != nil {
		return nil, err
	}
	employeeModel.EmpID = employee.EmpID
	employeeModel.EmpFolder = employee.EmpFolder
	employeeModel.Surname = employee.Surname
	employeeModel.FirstName = employee.FirstName
	employeeModel.LastName = employee.LastName
	employeeModel.Email = employee.Email
	employeeModel.Phone = employee.Phone
	employeeModel.Nic = employee.Nic
	employeeModel.PermanentAddress = employee.PermanentAddress
	employeeModel.ResidentialAddress = employee.ResidentialAddress
	employeeModel.State = employee.State
	employeeModel.ZipCode = employee.ZipCode
	employeeModel.MaritalStatus = employee.MaritalStatus
	employeeModel.Gender = employee.Gender
	employeeModel.DateOfBirth = employee.DateOfBirth
	employeeModel.JobTitle = employee.JobTitle
	employeeModel.Manager = employee.Manager
	employeeModel.EmployeeType = employee.EmployeeType
	employeeModel.EmploymentStatus = employee.EmploymentStatus
	employeeModel.HireDate = employee.HireDate
	employeeModel.HireSource = employee.HireSource
	employeeModel.WorkLocation = employee.WorkLocation
	employeeModel.Department = employee.Department
	employeeModel.RerNoP = employee.RerNoP
	employeeModel.RerNoO = employee.RerNoO
	employeeModel.RerNoS = employee.RerNoS
	employeeModel.RerNoC = employee.RerNoC
	employeeModel.RerNoW = employee.RerNoW
	employeeModel.RerNoA = employee.RerNoA
	employeeModel.BasicSalary = employee.BasicSalary
	employeeModel.AfterPromotionSalary = employee.AfterPromotionSalary
	employeeModel.TransportAllowance = employee.TransportAllowance
	employeeModel.OtherAllowance = employee.OtherAllowance
	employeeModel.HasOvertime = employee.HasOvertime
	employeeModel.OvertimeRate = employee.OvertimeRate
	employeeModel.HasAttendance = employee.HasAttendance
	employeeModel.HasPerformanceBonus = employee.HasPerformanceBonus
	employeeModel.SalaryPerHour = employee.SalaryPerHour
	employeeModel.SalaryPerDay = employee.SalaryPerDay
	employeeModel.SaleryCycle = employee.SalaryCycle
	employeeModel.TotalSalary = employee.TotalSalary
	employeeModel.NoOfAnnualLeave = employee.NoOfAnnualLeave
	employeeModel.NoOfCasualLeave = employee.NoOfCasualLeave
	employeeModel.NoOfSickLeave = employee.NoOfSickLeave
	employeeModel.NoOfMaternityLeave = employee.NoOfMaternityLeave
	employeeModel.HasEpf = employee.HasEpf
	employeeModel.EpfNo = employee.EpfNo
	employeeModel.EtfNo = employee.EtfNo
	employeeModel.Ol = employee.Ol
	employeeModel.Loa = employee.Loa
	employeeModel.IdStatus = employee.IdStatus
	employeeModel.PersonalFile = employee.PersonalFile
	employeeModel.BankName = employee.BankName
	employeeModel.Branch = employee.Branch
	employeeModel.AccountNo = employee.AccountNo
	employeeModel.AccountHolderName = employee.AccountHolderName
	employeeModel.ResignationDate = employee.ResignationDate
	employeeModel.TerminationDate = employee.TerminationDate
	employeeModel.Notes = employee.Notes
	err = hr.db.Updates(&employeeModel).Error
	if err != nil {
		logger.Error(ctx, "Error updating employee", zap.String("method", "PUT"), zap.String("path", "/hr/employee/:id"), zap.Any("employee", employee), zap.Error(err))
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := hr.db.First(&userModel, "clerk_id = ?", employeeModel.CreatedBy).Error; err == nil {
		employeeModel.User = userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", employeeModel.CreatedBy), zap.Error(err))
	}
	logger.Info(ctx, "Employee updated", zap.String("method", "PUT"), zap.String("path", "/hr/employee/:id"), zap.Any("employee", employee))
	return employeeModel.EmployeeModelToDomain(), nil
}

func (hr *HrRepository) GetMyInfoByID(ctx context.Context, email string) (*domain.Employee, error) {
	var employeeModel models.EmployeeModel

	if err := hr.db.WithContext(ctx).Where("email = ?", email).Preload("User").First(&employeeModel).Error; err != nil {
		return nil, err
	}

	var leaveModels []models.LeaveModel
	if err := hr.db.WithContext(ctx).Where("employee_id = ?", employeeModel.ID).Preload("Accept").Find(&leaveModels).Error; err != nil {
		return nil, err
	}

	domainEmployee := employeeModel.EmployeeModelToDomain()

	domainEmployee.PendingLeaves = make([]domain.Leave, 0)
	domainEmployee.TakenLeaves = make([]domain.Leave, 0)
	domainEmployee.RejectedLeaves = make([]domain.Leave, 0)

	currentYear := time.Now().Year()

	for _, l := range leaveModels {
		domainLeave := l.LeaveModelToDomain()

		var currentYearDates []time.Time
		for _, date := range l.Date {
			if date.Year() == currentYear {
				currentYearDates = append(currentYearDates, date)
			}
		}

		if len(currentYearDates) == 0 {
			continue
		}

		domainLeave.Date = currentYearDates

		daysTaken := len(currentYearDates)

		switch l.Status {
		case "Pending":
			domainEmployee.PendingLeaves = append(domainEmployee.PendingLeaves, *domainLeave)

		case "Approved":
			domainEmployee.TakenLeaves = append(domainEmployee.TakenLeaves, *domainLeave)

			switch l.Type {
			case "Annual":
				domainEmployee.TakenAnnualLeave += daysTaken
			case "Casual":
				domainEmployee.TakenCasualLeave += daysTaken
			case "Sick":
				domainEmployee.TakenSickLeave += daysTaken
			case "Maternity":
				domainEmployee.TakenMaternityLeave += daysTaken
			}

		case "Rejected":
			domainEmployee.RejectedLeaves = append(domainEmployee.RejectedLeaves, *domainLeave)
		}
	}

	return domainEmployee, nil
}

func (hr *HrRepository) CreateLeaveRequest(ctx context.Context, leave *domain.Leave) (*domain.Leave, error) {
	leaveModel := models.LeaveModelFromDomain(leave)

	if err := hr.db.Create(leaveModel).Error; err != nil {
		logger.Error(ctx, "Error creating leave request: ", zap.Error(err))
		return nil, err
	}

	logger.Info(ctx, "Leave request created", zap.String("method", "POST"), zap.Any("leave-request", leaveModel))
	return leaveModel.LeaveModelToDomain(), nil
}

func (hr *HrRepository) GetLeaveRequests(ctx context.Context, query string, limit int, offset int) ([]*domain.Leave, int, error) {
	var leaveModels []models.LeaveModel
	var total int64
	dbQuery := hr.db.WithContext(ctx).Model(&models.LeaveModel{}).
		Preload("Employee").
		Preload("User").
		Preload("Accept")

	if query != "" {
		searchStr := "%" + query + "%"

		dbQuery = dbQuery.
			Joins("LEFT JOIN employees ON leaves.employee_id = employees.id").
			Where("employees.first_name ILIKE ? OR employees.last_name ILIKE ? OR leaves.type ILIKE ? OR leaves.year ILIKE ? OR leaves.reason ILIKE ? OR leaves.status ILIKE ?",
				searchStr, searchStr, searchStr, searchStr, searchStr, searchStr)
	}

	if err := dbQuery.Count(&total).Error; err != nil {
		logger.Error(ctx, "Failed to count leave request", zap.Error(err))
		return nil, 0, err
	}

	if limit > 0 {
		dbQuery = dbQuery.Limit(limit)
	}
	if offset > 0 {
		dbQuery = dbQuery.Offset(offset)
	}

	if err := dbQuery.Order("leaves.created_at DESC").Find(&leaveModels).Error; err != nil {
		logger.Error(ctx, "Failed to fetch leave request", zap.Error(err))
		return nil, 0, err
	}

	domainLeaves := make([]*domain.Leave, 0, len(leaveModels))
	for i := range leaveModels {
		domainLeaves = append(domainLeaves, leaveModels[i].LeaveModelToDomain())
	}

	return domainLeaves, int(total), nil
}

func (hr *HrRepository) UpdateLeaveRequest(ctx context.Context, leave *domain.Leave) (*domain.Leave, error) {
	var leaveModel models.LeaveModel

	err := hr.db.Where("id = ?", leave.ID).First(&leaveModel).Error
	if err != nil {
		return nil, err
	}
	leaveModel.ID = leave.ID
	leaveModel.EmployeeId = leave.EmployeeId
	leaveModel.Type = leave.Type
	leaveModel.Year = leave.Year
	leaveModel.Date = leave.Date
	leaveModel.Reason = leave.Reason
	leaveModel.Proof = leave.Proof
	leaveModel.Status = leave.Status
	leaveModel.Comment = leave.Comment
	if leave.AcceptedBy != "" {
		leaveModel.AcceptedBy = &leave.AcceptedBy
	} else {
		leaveModel.AcceptedBy = nil
	}
	err = hr.db.Updates(&leaveModel).Error
	if err != nil {
		logger.Error(ctx, "Error updating leave request", zap.String("method", "PUT"), zap.String("path", "/hr/employee/leave-requst/:id"), zap.Any("leave-request", leave), zap.Error(err))
		return nil, err
	}
	err = hr.db.WithContext(ctx).Where("id = ?", leave.ID).First(&leaveModel).Error
	if err != nil {
		logger.Error(ctx, "Failed to fetch updated leave request", zap.Error(err))
		return nil, err
	}
	// Explicitly fetch the user by the ClerkID
	var userModel models.UserModel
	if err := hr.db.First(&userModel, "clerk_id = ?", leaveModel.CreatedBy).Error; err == nil {
		leaveModel.User = &userModel
	} else {
		logger.Error(ctx, "Error fetching user model by ClerkID", zap.String("clerk_id", leaveModel.CreatedBy), zap.Error(err))
	}
	logger.Info(ctx, "Leave request updated", zap.String("method", "PUT"), zap.String("path", "/hr/employee/leave-request:id"), zap.Any("leave-request", leave))
	return leaveModel.LeaveModelToDomain(), nil
}

func (r *HrRepository) GetPayrollEmployeeList(ctx context.Context, query string, limit int, offset int, salaryCycle string) ([]*domain.Employee, int, error) {
	var employeeModels []models.EmployeeModel
	var total int64

	db := r.db.WithContext(ctx).Model(&models.EmployeeModel{})

	twoMonthsAgo := time.Now().AddDate(0, -2, 0)
	db = db.Where(
		"(resignation_date IS NULL OR resignation_date < '1970-01-01' OR resignation_date >= ?) AND "+
			"(termination_date IS NULL OR termination_date < '1970-01-01' OR termination_date >= ?)",
		twoMonthsAgo, twoMonthsAgo,
	)

	if salaryCycle != "" {
		db = db.Where("salery_cycle = ?", salaryCycle)
	}

	if query != "" {
		searchQuery := "%" + query + "%"
		db = db.Where(
			"emp_id ILIKE ? OR first_name ILIKE ? OR last_name ILIKE ? OR department ILIKE ?",
			searchQuery, searchQuery, searchQuery, searchQuery,
		)
	}

	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if limit > 0 {
		db = db.Limit(limit)
	}
	if offset > 0 {
		db = db.Offset(offset)
	}

	if err := db.Order("created_at DESC").Find(&employeeModels).Error; err != nil {
		return nil, 0, err
	}

	var empIDs []uuid.UUID
	for _, emp := range employeeModels {
		empIDs = append(empIDs, emp.ID)
	}

	takenLeavesMap := make(map[uuid.UUID]map[string]int)

	if len(empIDs) > 0 {
		var leaves []models.LeaveModel
		if err := r.db.WithContext(ctx).
			Where("employee_id IN ? AND status = ?", empIDs, "Approved").
			Find(&leaves).Error; err == nil {

			for _, leave := range leaves {
				if takenLeavesMap[leave.EmployeeId] == nil {
					takenLeavesMap[leave.EmployeeId] = make(map[string]int)
				}
				takenLeavesMap[leave.EmployeeId][leave.Type] += len(leave.Date)
			}
		}
	}

	var domainEmployees []*domain.Employee
	for _, empModel := range employeeModels {
		domainEmp := empModel.EmployeeModelToDomain()

		if empLeaves, exists := takenLeavesMap[empModel.ID]; exists {
			domainEmp.TakenAnnualLeave = empLeaves["Annual"]
			domainEmp.TakenCasualLeave = empLeaves["Casual"]
			domainEmp.TakenSickLeave = empLeaves["Sick"]
			domainEmp.TakenMaternityLeave = empLeaves["Maternity"]
		}

		domainEmployees = append(domainEmployees, domainEmp)
	}

	return domainEmployees, int(total), nil
}

func (hr *HrRepository) CreatePayroll(ctx context.Context, payroll *domain.Payroll) (*domain.Payroll, error) {
	payrollModel := models.PayrollModelFromDomain(payroll)

	if err := hr.db.Create(payrollModel).Error; err != nil {
		logger.Error(ctx, "Error creating payroll request: ", zap.Error(err))
		return nil, err
	}

	if err := hr.db.Preload("Employee").First(payrollModel, "id = ?", payrollModel.ID).Error; err != nil {
		logger.Error(ctx, "Error loading employee data for payroll: ", zap.Error(err))
		return nil, err
	}

	logger.Info(ctx, "Payroll data created", zap.String("method", "POST"), zap.Any("payroll", payrollModel))
	return payrollModel.PayrollModelToDomain(), nil
}

func (r *HrRepository) GetPayrollHistoryList(ctx context.Context, query string, limit int, offset int, salaryCycle string, employeeID uuid.UUID, month string) ([]*domain.Payroll, int, error) {
	var payrollModels []*models.PayrollModel
	var totalCount int64

	tx := r.db.WithContext(ctx).
		Model(&models.PayrollModel{}).
		Joins("LEFT JOIN employees ON employees.id = payroll.employee_id")

	if employeeID != uuid.Nil {
		tx = tx.Where("payroll.employee_id = ?", employeeID)
	}

	if month != "" {
		tx = tx.Where("payroll.month = ?", month)
	}

	if salaryCycle != "" {
		tx = tx.Where("employees.salery_cycle = ?", salaryCycle)
	}
	if query != "" {
		searchPattern := "%" + query + "%"
		tx = tx.Where(`
			employees.emp_id ILIKE ? OR 
			employees.first_name ILIKE ? OR 
			employees.last_name ILIKE ? OR 
			payroll.payroll_period ILIKE ?`,
			searchPattern, searchPattern, searchPattern, searchPattern)
	}

	if err := tx.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	if err := tx.
		Preload("Employee").
		Order("payroll.created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&payrollModels).Error; err != nil {
		return nil, 0, err
	}
	var domainPayrolls []*domain.Payroll
	for _, p := range payrollModels {
		domainPayrolls = append(domainPayrolls, p.PayrollModelToDomain())
	}

	return domainPayrolls, int(totalCount), nil
}

func (hr *HrRepository) UpdatePayroll(ctx context.Context, payroll *domain.Payroll) (*domain.Payroll, error) {
	var payrollModel models.PayrollModel

	err := hr.db.Where("id = ?", payroll.ID).First(&payrollModel).Error
	if err != nil {
		return nil, err
	}
	payrollModel.EmployeeId = payroll.EmployeeId
	payrollModel.Month = payroll.Month
	payrollModel.PayrollPeriod = payroll.PayrollPeriod

	payrollModel.WorkingDays = payroll.WorkingDays
	payrollModel.LeaveEligible = payroll.LeaveEligible
	payrollModel.LeaveUtilized = payroll.LeaveUtilized
	payrollModel.LeaveBalance = payroll.LeaveBalance
	payrollModel.UnpaidLeave = payroll.UnpaidLeave

	payrollModel.AttendanceIncentive = payroll.AttendanceIncentive
	payrollModel.PerformanceIncentive = payroll.PerformanceIncentive
	payrollModel.OvertimeEarnings = payroll.OvertimeEarnings
	payrollModel.OvertimeRate = payroll.OvertimeRate
	payrollModel.Overtime = payroll.Overtime
	payrollModel.TravelAllowance = payroll.TravelAllowance
	payrollModel.OtherAllowance = payroll.OtherAllowance
	payrollModel.SalesCommission = payroll.SalesCommission
	payrollModel.Expense = payroll.Expense
	payrollModel.GrossSalary = payroll.GrossSalary

	payrollModel.Epf_8 = payroll.Epf_8
	payrollModel.Epf_15 = payroll.Epf_15
	payrollModel.SalaryAdvances = payroll.SalaryAdvances
	payrollModel.LeaveDeduction = payroll.LeaveDeduction
	payrollModel.LateAttendence = payroll.LateAttendence
	payrollModel.Other = payroll.Other
	payrollModel.WaterBill = payroll.WaterBill

	payrollModel.NetSalary = payroll.NetSalary
	payrollModel.PaymentMethod = payroll.PaymentMethod
	payrollModel.PaymentDate = payroll.PaymentDate

	err = hr.db.Updates(&payrollModel).Error
	if err != nil {
		logger.Error(ctx, "Error updating payroll", zap.String("method", "PUT"), zap.String("path", "/hr/employee/payroll"), zap.Any("payroll", payroll), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Employee updated", zap.String("method", "PUT"), zap.String("path", "/hr/employee/payroll"), zap.Any("payroll", payroll))
	return payrollModel.PayrollModelToDomain(), nil
}

func (hr *HrRepository) DeletePayrollHistory(ctx context.Context, payroll *domain.Payroll) (*domain.Payroll, error) {
	var payrollModel models.PayrollModel

	err := hr.db.Preload("Employee").First(&payrollModel, "id = ?", payroll.ID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, err
		}
		return nil, err
	}

	err = hr.db.Delete(&payrollModel).Error
	if err != nil {
		logger.Error(ctx, "Error deleting payroll", zap.String("method", "DELETE"), zap.String("path", "/hr/employee/payroll"), zap.Any("PayrollId", payrollModel.ID), zap.Error(err))
		return nil, err
	}

	return payrollModel.PayrollModelToDomain(), nil
}

func (hr *HrRepository) GetBirthdays(ctx context.Context, query string, limit int, offset int) ([]*domain.Employee, int, error) {
	var employeeModels []models.EmployeeModel
	var total int64

	dbQuery := hr.db.WithContext(ctx).Model(&models.EmployeeModel{}).
		Where("date_of_birth > ?", "1900-01-01").
		Where("(resignation_date IS NULL OR resignation_date < '1900-01-01')").
		Where("(termination_date IS NULL OR termination_date < '1900-01-01')")

	if query != "" {
		searchStr := "%" + query + "%"
		dbQuery = dbQuery.Where("first_name ILIKE ? OR last_name ILIKE ? OR surname ILIKE ? OR emp_id ILIKE ?", searchStr, searchStr, searchStr, searchStr)
	}

	if err := dbQuery.Count(&total).Error; err != nil {
		logger.Error(ctx, "Failed to count employees", zap.Error(err))
		return nil, 0, err
	}

	if limit > 0 {
		dbQuery = dbQuery.Limit(limit)
	}
	if offset > 0 {
		dbQuery = dbQuery.Offset(offset)
	}

	orderQuery := `
		CASE
			WHEN to_char(date_of_birth, 'MMDD') >= to_char(CURRENT_DATE, 'MMDD') THEN 0
			ELSE 1
		END ASC,
		to_char(date_of_birth, 'MMDD') ASC
	`

	if err := dbQuery.Order(orderQuery).Find(&employeeModels).Error; err != nil {
		logger.Error(ctx, "Failed to fetch employees", zap.Error(err))
		return nil, 0, err
	}

	domainEmployee := make([]*domain.Employee, 0, len(employeeModels))
	for i := range employeeModels {
		domainEmployee = append(domainEmployee, employeeModels[i].EmployeeModelToDomain())
	}

	return domainEmployee, int(total), nil
}

func (r *HrRepository) GetEmployeesWithBirthdayTomorrow(ctx context.Context) ([]*domain.Employee, error) {
	var employeeModels []models.EmployeeModel

	err := r.db.WithContext(ctx).
		Where("EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE + INTERVAL '1 day')").
		Where("EXTRACT(DAY FROM date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE + INTERVAL '1 day')").
		Where("(resignation_date IS NULL OR resignation_date < '1900-01-01')").
		Where("(termination_date IS NULL OR termination_date < '1900-01-01')").
		Find(&employeeModels).Error

	if err != nil {
		return nil, err
	}

	var domainEmployees []*domain.Employee
	for i := range employeeModels {
		domainEmployees = append(domainEmployees, employeeModels[i].EmployeeModelToDomain())
	}

	return domainEmployees, nil
}
