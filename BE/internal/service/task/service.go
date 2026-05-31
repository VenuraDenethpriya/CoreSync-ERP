package task

import (
	"context"
	"rims-backend/internal/service/domain"
	"rims-backend/internal/storage/repository"
	"time"
)

type Service interface {
	CreateTask(ctx context.Context, task *domain.Task) (*domain.Task, error)
	GetTasks(ctx context.Context, query string, limit int, offset int) ([]*domain.Task, int, error)
	UpdateTask(ctx context.Context, task *domain.Task) (*domain.Task, error)
	DeleteTask(ctx context.Context, task *domain.Task) (*domain.Task, error)
	GetCardTasks(ctx context.Context, query string, limit int, offset int) ([]*domain.Task, error)
	GetTaskByDateOrAssignee(ctx context.Context, startDate, endDate time.Time, assignee string) ([]*domain.Task, error)
}
type service struct {
	repo     repository.TaskRepository
	userRepo repository.UserRepository
}

func NewService(taskRepo repository.TaskRepository,
	userRepo repository.UserRepository) Service {
	return &service{
		repo:     taskRepo,
		userRepo: userRepo,
	}
}
