package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) UpdateQuoteStatus(ctx context.Context, quote *domain.Quote, actingClerkID string) (*domain.Quote, string, error) {
	updatedQuoteStatus, err := s.quoteRepo.UpdateQuoteStatus(ctx, quote)

	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}

	actorName := actor.FirstName + " " + actor.LastName
	return updatedQuoteStatus, actorName, nil
}
