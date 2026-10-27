package site

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) UpdateSite(ctx context.Context, site *domain.Site, actingClerkID string) (*domain.Site, string, error) {
	updatedSite, err := s.repo.UpdateSite(ctx, site)

	if err != nil {
		return nil, "", err
	}

	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}

	actorName := actor.FirstName + " " + actor.LastName

	return updatedSite, actorName, nil
}
