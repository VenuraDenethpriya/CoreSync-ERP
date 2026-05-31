package task

import (
	"context"
	"rims-backend/internal/service/domain"
	"time"
)

func (s *service) GetTaskByDateOrAssignee(ctx context.Context, startDate, endDate time.Time, assignee string) ([]*domain.Task, error) {
	return s.repo.GetTaskByDateOrAssignee(ctx, startDate, endDate, assignee)
}
