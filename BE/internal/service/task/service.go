package task

import (
	"CoreSync-backend/internal/service/domain"
	"CoreSync-backend/internal/storage/repository"
	"context"
	"time"
)

type Service interface {
	CreateTask(ctx context.Context, task *domain.Task) (*domain.Task, error)
	GetTasks(ctx context.Context, query string, limit int, offset int, assignee string, startDate, endDate time.Time) ([]*domain.Task, int, error)
	UpdateTask(ctx context.Context, task *domain.Task, actingClerkID string) (*domain.Task, string, error)
	DeleteTask(ctx context.Context, task *domain.Task, actingClerkID string) (*domain.Task, string, error)
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
