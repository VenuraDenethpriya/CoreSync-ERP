package user

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) GetUsers(ctx context.Context, query string, limit int, offset int) ([]*domain.User, int, error) {
	return s.repo.GetUsers(ctx, query, limit, offset)
}
