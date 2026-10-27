package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) CreatePayroll(ctx context.Context, payroll *domain.Payroll) (*domain.Payroll, error) {
	return s.hrRepo.CreatePayroll(ctx, payroll)
}
