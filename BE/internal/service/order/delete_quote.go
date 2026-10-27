package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"

	"github.com/google/uuid"
)

func (s *service) DeleteQuote(ctx context.Context, quoteID uuid.UUID, actingClerkID string) (*domain.Quote, string, error) {
	deletedQuote, err := s.quoteRepo.DeleteQuote(ctx, quoteID)

	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deletedQuote, actorName, nil
}
