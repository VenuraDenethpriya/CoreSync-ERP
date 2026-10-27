package mapper

import (
	dto "CoreSync-backend/internal/controller/http/dto"
	domain "CoreSync-backend/internal/service/domain"
)

func CasingRequestToDomain(req *dto.CreateCasingRequest) *domain.Casing {
	return &domain.Casing{
		ProductID: req.ProductID,
		Note:      req.Note,
		CreatedBy: req.CreatedBy,
	}
}

func WireHarnessRequestToDomain(req *dto.CreateWireHarnessRequest) *domain.WireHarness {
	return &domain.WireHarness{
		ProductID: req.ProductID,
		Note:      req.Note,
		CreatedBy: req.CreatedBy,
	}
}
