package task

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) CreateTask(ctx context.Context, task *domain.Task) (*domain.Task, error) {
	return s.repo.CreateTask(ctx, task)
}
