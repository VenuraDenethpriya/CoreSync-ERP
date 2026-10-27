package task

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) DeleteTask(ctx context.Context, task *domain.Task, actingClerkID string) (*domain.Task, string, error) {
	deletedTask, err := s.repo.DeleteTask(ctx, task)

	if err != nil {
		return nil, "", err
	}

	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}

	actorName := actor.FirstName + " " + actor.LastName

	return deletedTask, actorName, nil
}
