package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"

	"github.com/google/uuid"
)

func (s *service) DeletePack(ctx context.Context, packID uuid.UUID, actingClerkID string) (*domain.OrderItem, string, error) {
	deletePack, err := s.orderItemRepo.DeletePack(ctx, packID)
	if err != nil {
		return nil, "", err
	}
	s.stockPackChanged(ctx, packID, actingClerkID) // [ADDED 2026-10-13] reverse a completed pack's withdrawal
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}

	actorName := actor.FirstName + " " + actor.LastName
	return deletePack, actorName, nil
}
