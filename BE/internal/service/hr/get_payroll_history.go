package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"

	"github.com/google/uuid"
)

func (s *serviece) GetPayrollHistoryList(ctx context.Context, query string, limit int, offset int, salaryCycle string, employeeID uuid.UUID, month string) ([]*domain.Payroll, int, error) {
	getPayrollList, total, err := s.hrRepo.GetPayrollHistoryList(ctx, query, limit, offset, salaryCycle, employeeID, month)
	if err != nil {
		return nil, 0, err
	}
	return getPayrollList, total, nil
}
