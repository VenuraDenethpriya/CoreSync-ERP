package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) UpdateEmployee(ctx context.Context, employee *domain.Employee, actingClerkID string) (*domain.Employee, string, error) {
	updatedEmployee, err := s.hrRepo.UpdateEmployee(ctx, employee)
	if err != nil {
		return nil, "", err
	}
	// Get the actor (logged-in user)
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return updatedEmployee, actorName, nil

}
