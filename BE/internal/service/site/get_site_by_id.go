package site

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetSiteByID(ctx context.Context, site *domain.Site) (*domain.Site, error) {
	return s.repo.GetSiteByID(ctx, site)
}
