package hr

import (
	"CoreSync-backend/internal/service/domain"
	"CoreSync-backend/internal/service/email"
	"CoreSync-backend/internal/storage/repository"
	"CoreSync-backend/pkg/sms"
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service interface {
	CreateTalentPool(ctx context.Context, talentPool *domain.TalentPool) (*domain.TalentPool, error)
	GetTalentPools(ctx context.Context, query string, limit int, offset int) ([]*domain.TalentPool, int, error)
	GetTalentPoolByID(ctx context.Context, talentPool *domain.TalentPool) (*domain.TalentPool, error)
	UpdateTalentPool(ctx context.Context, talentPool *domain.TalentPool, actingClerkID string) (*domain.TalentPool, string, error)
	GetInterviewTrackers(ctx context.Context, query string, limit int, offset int) ([]*domain.TalentPool, int, error)
	GetInterviewTrackerByID(ctx context.Context, talentPool *domain.TalentPool) (*domain.TalentPool, error)
	DeleteInterviewTracker(ctx context.Context, talentPool *domain.TalentPool, actingClerkID string) (*domain.TalentPool, string, error)

	CreateEmployee(ctx context.Context, employee *domain.Employee, actingClerkID string) (*domain.Employee, string, error)
	GetEmployees(ctx context.Context, query string, limit int, offset int) ([]*domain.Employee, int, error)
	GetEmployeeByID(ctx context.Context, employee *domain.Employee) (*domain.Employee, error)
	DeleteEmployee(ctx context.Context, employee *domain.Employee, actingClerkID string) (*domain.Employee, string, error)
	UpdateEmployee(ctx context.Context, employee *domain.Employee, actingClerkID string) (*domain.Employee, string, error)
	GetMyInfoByID(ctx context.Context, email string) (*domain.Employee, error)

	CreateLeaveRequest(ctx context.Context, leave *domain.Leave) (*domain.Leave, error)
	GetLeaveRequests(ctx context.Context, query string, limit int, offset int) ([]*domain.Leave, int, error)
	UpdateLeaveRequest(ctx context.Context, leave *domain.Leave, actingClerkID string) (*domain.Leave, string, error)

	GetPayrollEmployeeList(ctx context.Context, query string, limit int, offset int, salaryCycle string) ([]*domain.Employee, int, error)
	CreatePayroll(ctx context.Context, payroll *domain.Payroll) (*domain.Payroll, error)
	GetPayrollHistoryList(ctx context.Context, query string, limit int, offset int, salaryCycle string, employeeID uuid.UUID, month string) ([]*domain.Payroll, int, error)
	UpdatePayroll(ctx context.Context, payroll *domain.Payroll, actingClerkID string) (*domain.Payroll, string, error)
	DeletePayrollHistory(ctx context.Context, payroll *domain.Payroll, actingClerkID string) (*domain.Payroll, string, error)

	GetBirthdays(ctx context.Context, query string, limit int, offset int) ([]*domain.Employee, int, error)
}

type serviece struct {
	db          *gorm.DB
	hrRepo      repository.HrRepository
	userRepo    repository.UserRepository
	emailSender email.EmailSender
	smsClient   sms.Sender
}

func NewService(
	db *gorm.DB,
	hrRepo repository.HrRepository,
	userRepo repository.UserRepository,
	emailSender email.EmailSender,
	smsClient sms.Sender) Service {
	return &serviece{
		db:          db,
		hrRepo:      hrRepo,
		userRepo:    userRepo,
		emailSender: emailSender,
		smsClient:   smsClient,
	}
}
