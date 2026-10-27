package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) DeletePayrollHistory(ctx context.Context, payroll *domain.Payroll, actingClerkID string) (*domain.Payroll, string, error) {
	deletePayroll, err := s.hrRepo.DeletePayrollHistory(ctx, payroll)
	if err != nil {
		return nil, "", err
	}
	actor, err := s.userRepo.FindByClerkID(ctx, actingClerkID)
	if err != nil {
		return nil, "", err
	}
	actorName := actor.FirstName + " " + actor.LastName
	return deletePayroll, actorName, nil
}
