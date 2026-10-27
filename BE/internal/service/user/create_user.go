package user

import (
	"CoreSync-backend/internal/service/domain"
	"context"
)

func (s *service) CreateUser(ctx context.Context, user *domain.User) (*domain.User, error) {
	return s.repo.CreateUser(ctx, user)
}
