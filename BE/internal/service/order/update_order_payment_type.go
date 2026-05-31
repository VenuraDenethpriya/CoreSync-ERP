package order

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdatePaymentType(ctx context.Context, payment *domain.Payment, actingClerkID string) (*domain.Payment, string, error) {
	updatePaymentType, err := s.paymentRepo.UpdatePaymentType(ctx, payment)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return updatePaymentType, actorName, nil
}
