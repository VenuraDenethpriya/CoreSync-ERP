package site

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) DeleteSite(ctx context.Context, site *domain.Site, actingClerkID string) (*domain.Site, string, error) {
	deletedSite, err := s.repo.DeleteSite(ctx, site)

	if err != nil {
		return nil, "", err
	}

	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}

	actorName := actor.FirstName + " " + actor.LastName

	return deletedSite, actorName, nil
}
