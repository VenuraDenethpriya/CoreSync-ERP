package mapper

import (
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/service/domain"
)

// ProductRequestToDomain converts a CreateProductRequest to a domain.Product
func ProductRequestToDomain(req *dto.CreateProductRequest) *domain.Product {
	return &domain.Product{
		Category:       req.Category,
		Name:           req.Name,
		Type:           req.Type,
		CellCount:      req.CellCount,
		CellType:       req.CellType,
		Voltage:        req.Voltage,
		Capacity:       req.Capacity,
		BmsType:        req.BmsType,
		Monitor:        req.Monitor,
		BasePrice:      req.BasePrice,
		SolarPanel:     req.SolarPanel,
		Inverter:       req.Inverter,
		Specifications: req.Specifications,
		CreatedBy:      req.CreatedBy,
	}
}

// ProductResponseToDomain converts a CreateProductResponse to a domain.Product
func ProductResponseToDomain(req *dto.CreateProductResponse) *domain.Product {
	return &domain.Product{
		Name: req.Name,
	}
}

// UpdateProductRequestToDomain converts a UpdateProductRequest to a domain.Product
func UpdateProductRequestToDomain(req *dto.UpdateProductRequest) *domain.Product {
	return &domain.Product{
		Category:       req.Category,
		Name:           req.Name,
		Type:           req.Type,
		CellCount:      req.CellCount,
		CellType:       req.CellType,
		Voltage:        req.Voltage,
		Capacity:       req.Capacity,
		BmsType:        req.BmsType,
		Monitor:        req.Monitor,
		BasePrice:      req.BasePrice,
		SolarPanel:     req.SolarPanel,
		Inverter:       req.Inverter,
		Specifications: req.Specifications,
		IsActive:       &req.IsActive,
	}
}

// UpdateProductResponseToDomain converts a UpdateProductResponse to a domain.Product
func UpdateProductResponseToDomain(req *dto.UpdateProductResponse) *domain.Product {
	return &domain.Product{
		Name: req.Name,
	}
}

type GetSearchProductResponse struct {
	Data []*domain.Product `json:"data"`
}
