package task

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) GetCardTasks(ctx context.Context, query string, limit int, offset int) ([]*domain.Task, error) {
	return s.repo.GetCardTasks(ctx, query, limit, offset)
}
