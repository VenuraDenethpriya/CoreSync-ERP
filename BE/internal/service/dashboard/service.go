package dashboard

import (
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/storage/repository"
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
