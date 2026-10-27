package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) GetTalentPools(ctx context.Context, query string, limit int, offset int) ([]*domain.TalentPool, int, error) {
	getTalentPools, total, err := s.hrRepo.GetTalentPools(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	return getTalentPools, total, nil
}
