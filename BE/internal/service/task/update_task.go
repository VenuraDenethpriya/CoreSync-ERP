package task

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) UpdateTask(ctx context.Context, task *domain.Task, actingClerkID string) (*domain.Task, string, error) {
	updatedTask, err := s.repo.UpdateTask(ctx, task)

	if err != nil {
		return nil, "", err
	}

	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}

	actorName := actor.FirstName + " " + actor.LastName

	return updatedTask, actorName, nil
}
