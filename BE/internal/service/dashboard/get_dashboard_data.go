package dashboard

import "rims-backend/internal/controller/http/dto"

func (s *service) GetDashboardData() (*dto.DashboardData, error) {
	return s.repo.GetDashboardData()
}
