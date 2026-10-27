package task

import (
	"CoreSync-backend/internal/service/domain"
	"context"
	"time"
)

func (s *service) GetTaskByDateOrAssignee(ctx context.Context, startDate, endDate time.Time, assignee string) ([]*domain.Task, error) {
	return s.repo.GetTaskByDateOrAssignee(ctx, startDate, endDate, assignee)
}
