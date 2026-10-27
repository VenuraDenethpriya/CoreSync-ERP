package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) GetInterviewTrackers(ctx context.Context, query string, limit int, offset int) ([]*domain.TalentPool, int, error) {
	getInterviewTracker, total, err := s.hrRepo.GetInterviewTrackers(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	return getInterviewTracker, total, nil
}
