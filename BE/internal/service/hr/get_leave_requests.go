package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) GetLeaveRequests(ctx context.Context, query string, limit int, offset int) ([]*domain.Leave, int, error) {
	getLeaves, total, err := s.hrRepo.GetLeaveRequests(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	return getLeaves, total, nil
}
