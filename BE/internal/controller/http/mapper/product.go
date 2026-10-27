package mapper

import (
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/service/domain"
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

func ProductBomRequestToDomainList(req *dto.CreateProductBomRequest) []*domain.Bom {
	var boms []*domain.Bom

	for _, item := range req.Items {
		bom := &domain.Bom{
			ProductID:   item.ProductID,
			InventoryID: item.InventoryID,
			Quantity:    item.Quantity,
			CreatedBy:   item.CreatedBy,
		}
		boms = append(boms, bom)
	}

	return boms
}
func UpdateProductBomRequestToDomain(req *dto.UpdateProductBomRequest) *domain.Bom {
	return &domain.Bom{
		Quantity: req.Quantity,
	}
}
