package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) DeleteInterviewTracker(ctx context.Context, talentPool *domain.TalentPool, actingClerkID string) (*domain.TalentPool, string, error) {
	deleteInterviewTracker, err := s.hrRepo.DeleteInterviewTracker(ctx, talentPool)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deleteInterviewTracker, actorName, nil
}
