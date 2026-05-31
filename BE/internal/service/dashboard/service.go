package dashboard

import (
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/storage/repository"
)

type Service interface {
	GetDashboardData() (*dto.DashboardData, error)
}
type service struct {
	repo repository.DashboardRepository
}

func NewService(dashboardRepo repository.DashboardRepository) Service {
	return &service{repo: dashboardRepo}
}
