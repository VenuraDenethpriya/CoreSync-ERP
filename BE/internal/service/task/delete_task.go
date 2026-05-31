package task

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) DeleteTask(ctx context.Context, task *domain.Task) (*domain.Task, error) {
	return s.repo.DeleteTask(ctx, task)
}
