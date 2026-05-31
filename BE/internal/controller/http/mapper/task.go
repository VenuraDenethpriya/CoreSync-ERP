package mapper

import (
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/service/domain"
)

func CreateTaskRequestToDomain(req *dto.CreateTaskRequest) *domain.Task {
	return &domain.Task{
		OrderId:     req.OrderId,
		JobId:       req.JobId,
		Task:        req.Task,
		Date:        req.Date,
		Time:        req.Time,
		Status:      req.Status,
		Assignee:    req.Assignee,
		Supervisor:  req.Supervisor,
		Description: req.Description,
	}
}
func CreateTaskResponseToDomain(res *dto.CreateTaskResponse) *domain.Task {
	return &domain.Task{
		ID:          res.ID,
		OrderId:     res.OrderId,
		JobId:       res.JobId,
		Task:        res.Task,
		Date:        res.Date,
		Time:        res.Time,
		Status:      res.Status,
		Assignee:    res.Assignee,
		Supervisor:  res.Supervisor,
		Description: res.Description,
		CreatedAt:   res.CreatedAt,
		UpdatedAt:   res.UpdatedAt,
	}
}
func UpdateTaskRequestToDomain(req *dto.UpdateTaskRequest) *domain.Task {
	return &domain.Task{
		ID:       req.ID,
		Task:     req.Task,
		Date:     req.Date,
		Time:     req.Time,
		Status:   req.Status,
		Assignee: req.Assignee,
		// Supervisor:  req.Supervisor,
		Description: req.Description,
	}
}
func UpdateTaskResponseToDomain(res *dto.UpdateTaskResponse) *domain.Task {
	return &domain.Task{
		ID:          res.ID,
		Task:        res.Task,
		Date:        res.Date,
		Time:        res.Time,
		Status:      res.Status,
		Assignee:    res.Assignee,
		Supervisor:  res.Supervisor,
		Description: res.Description,
		CreatedAt:   res.CreatedAt,
		UpdatedAt:   res.UpdatedAt,
	}
}
