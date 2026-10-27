package production

import (
	"CoreSync-backend/internal/service/domain"
	"CoreSync-backend/internal/storage/repository"
	"context"
)

type Service interface {
	CreateCasings(ctx context.Context, baseCasing *domain.Casing, quantity int) ([]*domain.Casing, error)
	GetCasings(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Casing, int64, error)
	CreateWireHarness(ctx context.Context, baseWireHarness *domain.WireHarness, quantity int) ([]*domain.WireHarness, error)
	GetWireHarness(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.WireHarness, int64, error)
}

type service struct {
	productionRepo repository.ProductionRepository
	userRepo       repository.UserRepository
}

func NewService(productionRepo repository.ProductionRepository, userRepo repository.UserRepository) Service {
	return &service{
		productionRepo: productionRepo,
		userRepo:       userRepo,
	}
}
