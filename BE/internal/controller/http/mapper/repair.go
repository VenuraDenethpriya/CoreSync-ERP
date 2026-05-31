package mapper

import (
	dto "rims-backend/internal/controller/http/dto"
	domain "rims-backend/internal/service/domain"
)

func RepairRequestToDomain(req *dto.CreateRepairRequest) *domain.Repair {
	return &domain.Repair{
		OrderId:       req.OrderId,
		JobNo:         req.JobNo,
		Description:   req.Description,
		Status:        req.Status,
		DueDate:       req.DueDate,
		Price:         req.Price,
		CustomerName:  req.CustomerName,
		CustomerPhone: req.CustomerPhone,
		CreatedBy:     req.CreatedBy,
		// CreatedAt:     req.CreatedAt,
		// UpdatedAt:     req.UpdatedAt,
	}
}
func UpdateRepairRequestToDomain(req *dto.UpdateRepairRequest) *domain.Repair {
	return &domain.Repair{
		Description:   req.Description,
		OrderId:       req.OrderId,
		Status:        req.Status,
		DueDate:       req.DueDate,
		Price:         req.Price,
		CustomerName:  req.CustomerName,
		CustomerPhone: req.CustomerPhone,
	}
}
func RepairItemUsageRequestToDomain(req *dto.CreateRepairItemUsageRequest) *domain.RepairItemUsage {
	return &domain.RepairItemUsage{
		ItemID:   req.ItemID,
		RepairID: req.RepairID,
		// UsageCount: req.UsageCount,
		UserName: req.UserName,
	}
}
