package finance

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) UpdatePurchaseOrder(ctx context.Context, purchaseOrder *domain.Finance, actingClerkID string) (*domain.Finance, string, error) {
	updatedPurchaseOrder, err := s.financeRepo.UpdatePurchaseOrder(ctx, purchaseOrder)

	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}

	actorName := actor.FirstName + " " + actor.LastName
	return updatedPurchaseOrder, actorName, nil
}
