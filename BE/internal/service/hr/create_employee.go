package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) CreateEmployee(ctx context.Context, employee *domain.Employee, actingClerkID string) (*domain.Employee, string, error) {
	createdEmployee, err := s.hrRepo.CreateEmployee(ctx, employee)
	if err != nil {
		return nil, "", err
	}

	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}

	actorName := actor.FirstName + " " + actor.LastName
	return createdEmployee, actorName, nil
}
