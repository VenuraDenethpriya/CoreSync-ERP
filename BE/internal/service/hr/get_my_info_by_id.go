package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) GetMyInfoByID(ctx context.Context, email string) (*domain.Employee, error) {
	return s.hrRepo.GetMyInfoByID(ctx, email)
}
