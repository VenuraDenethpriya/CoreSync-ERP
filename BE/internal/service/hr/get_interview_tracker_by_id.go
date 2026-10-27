package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) GetInterviewTrackerByID(ctx context.Context, talentPool *domain.TalentPool) (*domain.TalentPool, error) {
	return s.hrRepo.GetInterviewTrackerByID(ctx, talentPool)
}
