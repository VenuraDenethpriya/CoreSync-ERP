package task

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateTask(ctx context.Context, task *domain.Task) (*domain.Task, error) {
	return s.repo.CreateTask(ctx, task)
}
