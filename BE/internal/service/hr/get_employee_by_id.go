package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) GetEmployeeByID(ctx context.Context, employee *domain.Employee) (*domain.Employee, error) {
	return s.hrRepo.GetEmployeeByID(ctx, employee)
}
