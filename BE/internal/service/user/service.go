package user

import (
	"context"
	"rims-backend/internal/service/domain"
	"rims-backend/internal/storage/repository"
)

type Service interface {
	CreateUser(ctx context.Context, user *domain.User) (*domain.User, error)
	GetUsers(ctx context.Context, query string, limit int, offset int) ([]*domain.User, int, error)
	UpdateUser(ctx context.Context, user *domain.User, actingClerkID string) (*domain.User, string, error)
	DeleteUser(ctx context.Context, user *domain.User, actingClerkID string) (*domain.User, string, error)
}
type service struct {
	repo repository.UserRepository
}

func NewService(userRepo repository.UserRepository) Service {
	return &service{repo: userRepo}
}
