package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) GetTalentPoolByID(ctx context.Context, talentPool *domain.TalentPool) (*domain.TalentPool, error) {
	return s.hrRepo.GetTalentPoolByID(ctx, talentPool)
}
