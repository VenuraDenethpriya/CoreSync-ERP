package finance

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) DeletePurchaseOrder(ctx context.Context, purchaseOrder *domain.Finance, actingClerkID string) (*domain.Finance, string, error) {
	deletedPurchaseOrder, err := s.financeRepo.DeletePurchaseOrder(ctx, purchaseOrder)

	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deletedPurchaseOrder, actorName, nil
}
