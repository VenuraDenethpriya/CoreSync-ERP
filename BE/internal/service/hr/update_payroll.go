package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) UpdatePayroll(ctx context.Context, payroll *domain.Payroll, actingClerkID string) (*domain.Payroll, string, error) {
	updatedPayroll, err := s.hrRepo.UpdatePayroll(ctx, payroll)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return updatedPayroll, actorName, nil

}
