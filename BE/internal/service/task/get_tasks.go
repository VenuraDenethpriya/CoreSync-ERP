package task

import (
	"CoreSync-backend/internal/service/domain"
	"context"
	"time"
)

func (s *service) GetTasks(ctx context.Context, query string, limit int, offset int, assignee string, startDate, endDate time.Time) ([]*domain.Task, int, error) {
	getTasks, total, err := s.repo.GetTasks(ctx, query, limit, offset, assignee, startDate, endDate)
	if err != nil {
		return nil, 0, err
	}
	return getTasks, total, nil
}
