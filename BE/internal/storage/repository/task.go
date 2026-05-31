package repository

import (
	"context"
	"fmt"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/models"
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type TaskRepository struct {
	db       *gorm.DB
	userRepo UserRepositoryInterface
}

func NewTaskRepository(db *gorm.DB, userRepo UserRepositoryInterface) *TaskRepository {
	return &TaskRepository{
		db:       db,
		userRepo: userRepo,
	}
}

func (tr *TaskRepository) CreateTask(ctx context.Context, task *domain.Task) (*domain.Task, error) {
	taskModel := models.TaskFromDomain(task)
	if err := tr.db.Create(taskModel).Error; err != nil {
		logger.Error(ctx, "Error creating task: ", zap.String("method", "POST"), zap.String("path", "task"), zap.Any("task", task), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Task created", zap.String("method", "POST"), zap.String("path", "task"), zap.Any("task", task))
	return taskModel.TaskToDomain(), nil
}

func (tr *TaskRepository) GetTasks(ctx context.Context, query string, limit int, offset int) ([]*domain.Task, int, error) {
	var tasks []*models.TaskModel
	searchPattern := "%" + query + "%"
	var totalTasks int64

	if err := tr.db.Model(&models.TaskModel{}).Where("task ILIKE ? OR status ILIKE ?", searchPattern, searchPattern).Count(&totalTasks).Error; err != nil {
		logger.Error(ctx, "Error counting tasks", zap.Error(err))
		return nil, 0, err
	}

	if err := tr.db.Preload("Order").Preload("Repair").Where("task ILIKE ? OR status ILIKE ?", searchPattern, searchPattern).Order("created_at DESC").Limit(limit).Offset(offset).Find(&tasks).Error; err != nil {
		logger.Error(ctx, "Error retrieving tasks", zap.Error(err))
		return nil, 0, err
	}

	clerkIDs := make(map[string]struct{})
	for _, task := range tasks {
		if task.Assignee != "" {
			clerkIDs[task.Assignee] = struct{}{}
		}
		if task.Supervisor != "" {
			clerkIDs[task.Supervisor] = struct{}{}
		}
	}

	idSlice := make([]string, 0, len(clerkIDs))
	for id := range clerkIDs {
		idSlice = append(idSlice, id)
	}

	userMap, err := tr.userRepo.FindManyByClerkIDs(ctx, idSlice)
	if err != nil {
		logger.Error(ctx, "Could not fetch user details for tasks", zap.Error(err))
	}

	domainTasks := make([]*domain.Task, 0, len(tasks))
	for _, t := range tasks {
		domainTask := t.TaskToDomain()

		if user, ok := userMap[t.Assignee]; ok {
			domainTask.Assignee = fmt.Sprintf("%s %s", user.FirstName, user.LastName)
		}

		if user, ok := userMap[t.Supervisor]; ok {
			domainTask.Supervisor = fmt.Sprintf("%s %s", user.FirstName, user.LastName)
		}

		if t.Order.OrderID != uuid.Nil {
			domainTask.OrderNo = t.Order.OrderNo
			domainTask.OrderType = t.Order.Type
		}
		if t.JobId != nil && *t.JobId != uuid.Nil {
			domainTask.JobNo = t.Repair.JobNo
		}
		domainTasks = append(domainTasks, domainTask)
	}

	return domainTasks, int(totalTasks), nil
}

func (tr *TaskRepository) UpdateTask(ctx context.Context, task *domain.Task) (*domain.Task, error) {
	// Find the existing task by ID
	var existingTask models.TaskModel
	err := tr.db.First(&existingTask, "id = ?", task.ID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	// Update the task fields
	existingTask.Task = task.Task
	existingTask.Date = task.Date
	existingTask.Time = task.Time
	existingTask.Status = task.Status
	existingTask.Assignee = task.Assignee
	existingTask.Supervisor = task.Supervisor
	existingTask.Description = task.Description
	if err := tr.db.Updates(&existingTask).Error; err != nil {
		logger.Error(ctx, "Error updating task: ", zap.String("method", "PUT"), zap.String("path", "task"), zap.Any("task", task), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Task updated", zap.String("method", "PUT"), zap.String("path", "task"), zap.Any("task", task))
	return existingTask.TaskToDomain(), nil
}
func (tr *TaskRepository) DeleteTask(ctx context.Context, task *domain.Task) (*domain.Task, error) {
	var existingTask models.TaskModel
	err := tr.db.First(&existingTask, "id = ?", task.ID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	if err := tr.db.Delete(&existingTask).Error; err != nil {
		logger.Error(ctx, "Error deleting task: ", zap.String("method", "DELETE"), zap.String("path", "task"), zap.Any("task", task), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "Task deleted", zap.String("method", "DELETE"), zap.String("path", "task"), zap.Any("task", task))
	return existingTask.TaskToDomain(), nil
}

func (tr *TaskRepository) GetCardTasks(ctx context.Context, searchQuery string, limit int, offset int) ([]*domain.Task, error) {
	var tasks []*models.TaskModel
	searchPattern := "%" + searchQuery + "%"

	err := tr.db.WithContext(ctx).
		Joins("LEFT JOIN orders ON orders.order_id = tasks.order_id").
		Preload("Order.OrderItems.Name").
		Preload("Repair").
		Where("tasks.task ILIKE ? OR orders.order_no ILIKE ?", searchPattern, searchPattern).
		Order("tasks.updated_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&tasks).Error

	if err != nil {
		logger.Error(ctx, "Error retrieving card tasks", zap.Error(err))
		return nil, err
	}
	if len(tasks) == 0 {
		return []*domain.Task{}, nil
	}

	clerkIDs := make(map[string]struct{})
	for _, task := range tasks {
		if task.Assignee != "" {
			clerkIDs[task.Assignee] = struct{}{}
		}
		if task.Supervisor != "" {
			clerkIDs[task.Supervisor] = struct{}{}
		}
	}

	idSlice := make([]string, 0, len(clerkIDs))
	for id := range clerkIDs {
		idSlice = append(idSlice, id)
	}

	userMap := make(map[string]*domain.User)
	if len(idSlice) > 0 {
		fetchedUsersAsModels, err := tr.userRepo.FindManyByClerkIDs(ctx, idSlice)
		if err != nil {
			logger.Error(ctx, "Could not fetch user details for tasks", zap.Error(err))
		} else {
			for clerkID, userModel := range fetchedUsersAsModels {
				userMap[clerkID] = userModel.UserModelToDomain()
			}
		}
	}

	domainTasks := make([]*domain.Task, 0, len(tasks))
	for _, t := range tasks {
		domainTask := t.TaskToDomain()

		if user, ok := userMap[t.Assignee]; ok {
			domainTask.Assignee = fmt.Sprintf("%s %s", user.FirstName, user.LastName)
		}
		if user, ok := userMap[t.Supervisor]; ok {
			domainTask.Supervisor = fmt.Sprintf("%s %s", user.FirstName, user.LastName)
		}

		domainTasks = append(domainTasks, domainTask)
	}

	return domainTasks, nil
}

func (tr *TaskRepository) GetTaskByDateOrAssignee(ctx context.Context, startDate, endDate time.Time, assignee string) ([]*domain.Task, error) {
	var tasks []*models.TaskModel

	query := tr.db.Debug().WithContext(ctx).
		Preload("Order").
		Preload("Order.OrderItems").
		Preload("AssigneeUser").
		Preload("SupervisorUser")

	if !startDate.IsZero() && !endDate.IsZero() {
		query = query.Where("date::date >= ?::date AND date::date <= ?::date",
			startDate.Format("2006-01-02"),
			endDate.Format("2006-01-02"),
		)
	}

	if assignee != "" && assignee != "all" {
		query = query.Where("assignee = ?", assignee)
	}

	err := query.Order("created_at DESC").Find(&tasks).Error

	if err != nil {
		logger.Error(ctx, "Error retrieving tasks", zap.Error(err))
		return nil, err
	}

	domainTasks := make([]*domain.Task, 0, len(tasks))
	for _, t := range tasks {
		domainTasks = append(domainTasks, t.TaskToDomain())
	}

	return domainTasks, nil
}
