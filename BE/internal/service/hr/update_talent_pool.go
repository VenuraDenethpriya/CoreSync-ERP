package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) UpdateTalentPool(ctx context.Context, talentPool *domain.TalentPool, actingClerkID string) (*domain.TalentPool, string, error) {
	updatedTalentPool, err := s.hrRepo.UpdateTalentPool(ctx, talentPool)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return updatedTalentPool, actorName, nil

}
