package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) GetPayrollEmployeeList(ctx context.Context, query string, limit int, offset int, salaryCycle string) ([]*domain.Employee, int, error) {
	getEmployeeList, total, err := s.hrRepo.GetPayrollEmployeeList(ctx, query, limit, offset, salaryCycle)
	if err != nil {
		return nil, 0, err
	}
	return getEmployeeList, total, nil
}
