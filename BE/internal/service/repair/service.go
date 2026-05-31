package repair

import (
	"context"
	"github.com/google/uuid"
	"rims-backend/internal/service/domain"

	"rims-backend/internal/storage/repository"

	"gorm.io/gorm"
)

type Service interface {
	CreateRepair(ctx context.Context, repair *domain.Repair, actingClerkID string) (*domain.Repair, string, error)
	GetRepairs(ctx context.Context, query string, limit int, offset int) ([]*domain.Repair, int, error)
	UpdateRepair(ctx context.Context, repair *domain.Repair, actingClerkID string) (*domain.Repair, string, error)
	DeleteRepair(ctx context.Context, repair *domain.Repair, actingClerkID string) (*domain.Repair, string, error)
	GetRepairByID(ctx context.Context, repair *domain.Repair) (*domain.Repair, error)
	GetLastRepairNo(ctx context.Context) (string, error)
	CreateRepairItemUsage(ctx context.Context, usageReq domain.RepairItemUsage) (*domain.RepairItemUsage, error)
	GetRepairItemUsages(ctx context.Context, jobID uuid.UUID, itemID uuid.UUID, limit int, offset int) ([]*domain.RepairItemUsage, int, string, error)
}

type service struct {
	db         *gorm.DB
	repairRepo repository.RepairRepository
	userRepo   repository.UserRepository
}

func NewService(
	db *gorm.DB,
	repairRepo repository.RepairRepository,
	userRepo repository.UserRepository) Service {
	return &service{
		db:         db,
		repairRepo: repairRepo,
		userRepo:   userRepo,
	}
}
