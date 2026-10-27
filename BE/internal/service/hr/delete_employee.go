package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) DeleteEmployee(ctx context.Context, employee *domain.Employee, actingClerkID string) (*domain.Employee, string, error) {
	deleteEmployee, err := s.hrRepo.DeleteEmployee(ctx, employee)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deleteEmployee, actorName, nil
}
