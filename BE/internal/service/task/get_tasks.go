package task

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetTasks(ctx context.Context, query string, limit int, offset int) ([]*domain.Task, int, error) {
	getTasks, total, err := s.repo.GetTasks(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	return getTasks, total, nil
}
