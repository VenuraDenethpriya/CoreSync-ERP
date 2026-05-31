package task

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) UpdateTask(ctx context.Context, task *domain.Task) (*domain.Task, error) {
	return s.repo.UpdateTask(ctx, task)
}
