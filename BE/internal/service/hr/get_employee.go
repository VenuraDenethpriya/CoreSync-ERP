package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) GetEmployees(ctx context.Context, query string, limit int, offset int) ([]*domain.Employee, int, error) {
	getEmployees, total, err := s.hrRepo.GetEmployees(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	return getEmployees, total, nil
}
