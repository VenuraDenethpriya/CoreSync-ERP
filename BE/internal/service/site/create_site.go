package site

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateSite(ctx context.Context, site *domain.Site) (*domain.Site, error) {
	return s.repo.CreateSite(ctx, site)
}
