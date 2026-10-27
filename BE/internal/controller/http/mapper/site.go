package mapper

import (
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/service/domain"
)

func CreateSiteRequestToDomain(req *dto.CreateSiteRequest) *domain.Site {
	return &domain.Site{
		OrderID:     req.OrderId,
		Location:    req.Location,
		Assignee:    req.Assingee,
		Date:        req.Date,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		Capacity:    req.Capacity,
		PanelType:   req.PanelType,
		SolarType:   req.SolarType,
		Inverter:    req.Inverter,
		Status:      req.Status,
		Description: req.Description,
		CreatedBy:   req.CratedBy,
	}
}
func UpdateSiteRequestToDomain(req *dto.UpdateSiteRequest) *domain.Site {
	return &domain.Site{
		ID:          req.ID,
		OrderID:     req.OrderId,
		Location:    req.Location,
		Assignee:    req.Assingee,
		Date:        req.Date,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		Capacity:    req.Capacity,
		PanelType:   req.PanelType,
		SolarType:   req.SolarType,
		Inverter:    req.Inverter,
		Status:      req.Status,
		Description: req.Description,
	}
}
