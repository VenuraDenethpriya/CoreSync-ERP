package user

import (
	"context"
	"rims-backend/internal/service/domain"
)

func (s *service) CreateUser(ctx context.Context, user *domain.User) (*domain.User, error) {
	return s.repo.CreateUser(ctx, user)
}
