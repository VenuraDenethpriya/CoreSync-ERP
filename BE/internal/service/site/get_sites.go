package site

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetSites(ctx context.Context, query string, limit int, offset int) ([]*domain.Site, int, error) {
	getSites, total, err := s.repo.GetSites(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	return getSites, total, nil
}
