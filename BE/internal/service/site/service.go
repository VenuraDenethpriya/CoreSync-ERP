package site

import (
	"CoreSync-backend/internal/service/domain"
	"CoreSync-backend/internal/storage/repository"
	"context"

	"gorm.io/gorm"
)

type Service interface {
	CreateSite(ctx context.Context, site *domain.Site) (*domain.Site, error)
	GetSites(ctx context.Context, query string, limit int, offset int) ([]*domain.Site, int, error)
	GetSiteByID(ctx context.Context, site *domain.Site) (*domain.Site, error)
	DeleteSite(ctx context.Context, site *domain.Site, actingClerkID string) (*domain.Site, string, error)
	UpdateSite(ctx context.Context, site *domain.Site, actingClerkID string) (*domain.Site, string, error)
}

type service struct {
	db       *gorm.DB
	repo     repository.SiteRepository
	userRepo repository.UserRepository
}

func NewService(
	db *gorm.DB,
	siteRepo repository.SiteRepository,
	userRepo repository.UserRepository) Service {
	return &service{
		db:       db,
		repo:     siteRepo,
		userRepo: userRepo,
	}

}
