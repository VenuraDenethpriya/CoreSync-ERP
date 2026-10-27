package mapper

import (
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/service/domain"

	"github.com/google/uuid"
)

func CreateTaskRequestToDomain(req *dto.CreateTaskRequest) *domain.Task {
	var orderId, jobId, packId uuid.UUID

	if req.OrderId != nil {
		orderId = *req.OrderId
	}
	if req.JobId != nil {
		jobId = *req.JobId
	}
	if req.PackId != nil {
		packId = *req.PackId
	}

	return &domain.Task{
		OrderId:     orderId,
		JobId:       jobId,
		PackId:      packId,
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
		PackId:      res.PackId,
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
