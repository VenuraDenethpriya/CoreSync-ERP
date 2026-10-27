package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) UpdateQuote(ctx context.Context, quote *domain.Quote, actingClerkID string) (*domain.Quote, string, error) {
	updatedQuote, err := s.quoteRepo.UpdateQuote(ctx, quote)

	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}

	actorName := actor.FirstName + " " + actor.LastName
	return updatedQuote, actorName, nil
}
