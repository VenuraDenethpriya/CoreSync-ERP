package dto

import (
	"rims-backend/internal/service/domain"
	"time"

	"github.com/google/uuid"
)

type CreateTaskRequest struct {
	OrderId     uuid.UUID `json:"order_id"`
	JobId       uuid.UUID `json:"job_id"`
	Task        string    `json:"task" binding:"required"`
	Date        time.Time `json:"date" binding:"required"`
	Time        string    `json:"time"`
	Status      string    `json:"status"`
	Assignee    string    `json:"assignee" binding:"required"`
	Supervisor  string    `json:"supervisor" binding:"required"`
	Description string    `json:"description"`
}

type CreateTaskResponse struct {
	ID          uuid.UUID `json:"id"`
	OrderId     uuid.UUID `json:"order_id"`
	JobId       uuid.UUID `json:"job_id"`
	Task        string    `json:"task"`
	Date        time.Time `json:"date"`
	Time        string    `json:"time"`
	Status      string    `json:"status"`
	Assignee    string    `json:"assignee"`
	Supervisor  string    `json:"supervisor"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func NewCreateTaskResponse(task *domain.Task) *CreateTaskResponse {
	return &CreateTaskResponse{
		ID:          task.ID,
		OrderId:     task.OrderId,
		JobId:       task.JobId,
		Task:        task.Task,
		Date:        task.Date,
		Time:        task.Time,
		Status:      task.Status,
		Assignee:    task.Assignee,
		Supervisor:  task.Supervisor,
		Description: task.Description,
		CreatedAt:   task.CreatedAt,
		UpdatedAt:   task.UpdatedAt,
	}
}

type GetTaskRequest struct {
	Query  string `form:"query"`
	Limit  int    `form:"limit"`
	Offset int    `form:"offset"`
}

type TaskData struct {
	ID          uuid.UUID `json:"id"`
	OrderId     uuid.UUID `json:"order_id"`
	OrderNo     string    `json:"order_no"`
	JobNo       string    `json:"job_no"`
	Task        string    `json:"task"`
	Date        time.Time `json:"date"`
	Time        string    `json:"time"`
	Status      string    `json:"status"`
	Assignee    string    `json:"assignee"`
	Supervisor  string    `json:"supervisor"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type GetTaskResponse struct {
	Task       []TaskData `json:"task"`
	Total      int        `json:"total"`
	TotalTasks int        `json:"total_tasks"`
}

func NewGetTaskResponse(task []*domain.Task, totalTasks int) *GetTaskResponse {
	var response []TaskData
	for _, t := range task {
		response = append(response, TaskData{
			ID:          t.ID,
			OrderNo:     t.OrderType + t.OrderNo,
			JobNo:       t.JobNo,
			OrderId:     t.OrderId,
			Task:        t.Task,
			Date:        t.Date,
			Time:        t.Time,
			Status:      t.Status,
			Assignee:    t.Assignee,
			Supervisor:  t.Supervisor,
			Description: t.Description,
			CreatedAt:   t.CreatedAt,
			UpdatedAt:   t.UpdatedAt,
		})
	}
	return &GetTaskResponse{
		Task:       response,
		Total:      len(response),
		TotalTasks: totalTasks,
	}
}

type GetTaskIdRequest struct {
	ID string `uri:"taskId" json:"taskId"`
}
type GetTaskIdResponse struct {
	ID          uuid.UUID `json:"id"`
	OrderId     uuid.UUID `json:"order_id"`
	Task        string    `json:"task"`
	Date        time.Time `json:"date"`
	Time        string    `json:"time"`
	Status      string    `json:"status"`
	Assignee    string    `json:"assignee"`
	Supervisor  string    `json:"supervisor"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func NewGetTaskIdResponse(task *domain.Task) *GetTaskIdResponse {
	return &GetTaskIdResponse{
		ID:          task.ID,
		OrderId:     task.OrderId,
		Task:        task.Task,
		Date:        task.Date,
		Time:        task.Time,
		Status:      task.Status,
		Assignee:    task.User.FirstName + " " + task.User.LastName,
		Supervisor:  task.User.FirstName + " " + task.User.LastName,
		Description: task.Description,
		CreatedAt:   task.CreatedAt,
		UpdatedAt:   task.UpdatedAt,
	}
}

type UpdateTaskRequest struct {
	ID       uuid.UUID `json:"id" binding:"required"`
	Task     string    `json:"task"`
	Date     time.Time `json:"date"`
	Time     string    `json:"time"`
	Status   string    `json:"status"`
	Assignee string    `json:"assignee"`
	// Supervisor  string `json:"supervisor" binding:"required"`
	Description string `json:"description"`
}
type UpdateTaskResponse struct {
	ID          uuid.UUID `json:"id"`
	OrderId     uuid.UUID `json:"order_id"`
	Task        string    `json:"task"`
	Date        time.Time `json:"date"`
	Time        string    `json:"time"`
	Status      string    `json:"status"`
	Assignee    string    `json:"assignee"`
	Supervisor  string    `json:"supervisor"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func NewUpdateTaskResponse(task *domain.Task) *UpdateTaskResponse {
	return &UpdateTaskResponse{
		ID:          task.ID,
		OrderId:     task.OrderId,
		Task:        task.Task,
		Date:        task.Date,
		Time:        task.Time,
		Status:      task.Status,
		Assignee:    task.User.FirstName + " " + task.User.LastName,
		Supervisor:  task.User.FirstName + " " + task.User.LastName,
		Description: task.Description,
		CreatedAt:   task.CreatedAt,
		UpdatedAt:   task.UpdatedAt,
	}
}

type DeleteTaskRequest struct {
	TaskID string `uri:"taskId" json:"taskId"`
}

type DeleteTaskResponse struct {
	ID uuid.UUID `json:"id"`
}

func NewDeleteTaskResponse(task *domain.Task) *DeleteTaskResponse {
	return &DeleteTaskResponse{
		ID: task.ID,
	}
}

type TaskCardResponse struct {
	ID          uuid.UUID `json:"id"`
	Type        string    `json:"type"`
	OrderId     uuid.UUID `json:"order_id"`
	OrderNo     string    `json:"order_no"`
	JobId       uuid.UUID `json:"Job_id"`
	JobNo       string    `json:"Job_no"`
	Task        string    `json:"task"`
	Assignee    string    `json:"assignee"`
	Date        time.Time `json:"date"`
	Time        string    `json:"time"`
	Status      string    `json:"status"`
	Description string    `json:"description"`
	Supervisor  string    `json:"supervisor"`
}

type GetOrderItemsForTask struct {
	ProductName string `json:"product_name"`
	Quantity    int    `json:"quantity"`
}

type GetTaskCardResponse struct {
	Task  TaskCardResponse       `json:"task"`
	Items []GetOrderItemsForTask `json:"items"`
}

type GetTaskCardList struct {
	Tasks []GetTaskCardResponse `json:"tasks"`
}

func NewGetTaskCardListResponse(tasks []*domain.Task) *GetTaskCardList {
	taskListResponse := &GetTaskCardList{
		Tasks: []GetTaskCardResponse{},
	}

	for _, domainTask := range tasks {
		var responseItems []GetOrderItemsForTask

		if domainTask.OrderItems != nil {
			for _, domainItem := range domainTask.OrderItems {
				var pName string
				if domainItem.ProductName != nil {
					pName = domainItem.ProductName.Name
				}

				responseItems = append(responseItems, GetOrderItemsForTask{
					ProductName: pName,
					Quantity:    domainItem.Quantity,
				})
			}
		}

		taskWithItems := GetTaskCardResponse{
			Task: TaskCardResponse{
				ID:          domainTask.ID,
				Type:        domainTask.OrderType,
				OrderId:     domainTask.OrderId,
				OrderNo:     domainTask.OrderNo,
				JobId:       domainTask.JobId,
				JobNo:       domainTask.JobNo,
				Task:        domainTask.Task,
				Assignee:    domainTask.Assignee,
				Date:        domainTask.Date,
				Time:        domainTask.Time,
				Status:      domainTask.Status,
				Description: domainTask.Description,
				Supervisor:  domainTask.Supervisor,
			},
			Items: responseItems,
		}
		taskListResponse.Tasks = append(taskListResponse.Tasks, taskWithItems)
	}

	return taskListResponse
}

type GetTaskByDateRanageOrAssigneeRequest struct {
	Assignee  string    `form:"assignee"`
	StartDate time.Time `form:"start_date" time_format:"2006-01-02"`
	EndDate   time.Time `form:"end_date" time_format:"2006-01-02"`
}

type TaskResponse struct {
	ID          uuid.UUID `json:"id"`
	OrderNo     string    `json:"order_no"`
	OrderId     uuid.UUID `json:"order_id"`
	Task        string    `json:"task"`
	Date        time.Time `json:"date"`
	Time        string    `json:"time"`
	Status      string    `json:"status"`
	Assignee    string    `json:"assignee"`
	Supervisor  string    `json:"supervisor"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Function to map a single domain task to a response DTO
func NewTaskResponse(t *domain.Task) *TaskResponse {
	return &TaskResponse{
		ID:          t.ID,
		OrderId:     t.OrderId,
		OrderNo:     t.OrderType + t.OrderNo,
		Task:        t.Task,
		Date:        t.Date,
		Time:        t.Time,
		Status:      t.Status,
		Assignee:    t.AssigneeUser.FirstName + " " + t.AssigneeUser.LastName,
		Supervisor:  t.SupervisorUser.FirstName + " " + t.SupervisorUser.LastName,
		Description: t.Description,
		CreatedAt:   t.CreatedAt,
		UpdatedAt:   t.UpdatedAt,
	}
}
