package hr

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *serviece) GetBirthdays(ctx context.Context, query string, limit int, offset int) ([]*domain.Employee, int, error) {
	getBirthdays, total, err := s.hrRepo.GetBirthdays(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	return getBirthdays, total, nil
}
