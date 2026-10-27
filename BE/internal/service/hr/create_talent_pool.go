package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) CreateTalentPool(ctx context.Context, talentPool *domain.TalentPool) (*domain.TalentPool, error) {
	return s.hrRepo.CreateTalentPool(ctx, talentPool)
}
