package dashboard

import "CoreSync-backend/internal/controller/http/dto"

func (s *service) GetDashboardData() (*dto.DashboardData, error) {
	return s.repo.GetDashboardData()
}
