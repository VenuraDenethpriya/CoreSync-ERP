package order

import (
	"CoreSync-backend/internal/service/domain"
	"context"
	"fmt"
)

func (s *service) UpdatePayment(ctx context.Context, payment *domain.Payment, actingClerkID string) (*domain.Payment, string, error) {
	updatedPayment, err := s.paymentRepo.UpdatePayment(ctx, payment)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := fmt.Sprintf("%s %s", actor.FirstName, actor.LastName)
	return updatedPayment, actorName, nil
}
