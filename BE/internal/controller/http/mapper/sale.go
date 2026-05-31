package mapper

import (
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/service/domain"
)

func SaleRequestToDomain(req *dto.CreateSaleRequest) *domain.Sale {
	return &domain.Sale{
		Salesperson:   req.Salesperson,
		SalesType:     req.Type,
		Status:        req.Status,
		Commission:    &req.Commission,
		Date:          req.Date,
		CustomerName:  req.CustomerName,
		CustomerPhone: req.CustomerPhone,
		Description:   req.Description,
		RecordingURL:  req.RecordingURL,
		UpdatedBy:     req.UpdatedBy,
	}
}

func UpdateSaleRequestToDomain(req *dto.UpdateSaleRequest) *domain.Sale {
	return &domain.Sale{
		Salesperson:   req.Salesperson,
		SalesType:     req.Type,
		Status:        req.Status,
		Commission:    &req.Commission,
		Date:          req.Date,
		CustomerName:  req.CustomerName,
		CustomerPhone: req.CustomerPhone,
		Description:   req.Description,
		RecordingURL:  req.RecordingURL,
	}
}

func SalespersonRequestToDomain(req *dto.CreateSalespersonRequest) *domain.Salesperson {
	return &domain.Salesperson{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		PhoneNo:   req.PhoneNo,
		Email:     req.Email,
		CreatedBy: req.CreatedBy,
	}
}

func UpdateSalespersonRequestToDomain(req *dto.UpdateSalespersonRequest) *domain.Salesperson {
	return &domain.Salesperson{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		PhoneNo:   req.PhoneNo,
		Email:     req.Email,
	}
}
func CallRequestToDomain(req *dto.CreateCallRequest) *domain.Call {
	return &domain.Call{
		CallFlowID:    req.CallFlowID,
		CompanyID:     req.CompanyID,
		CustomerCli:   req.CustomerCli,
		AgentCli:      req.AgentCli,
		CallType:      req.CallType,
		Status:        req.Status,
		CallStartTime: req.CallStartTime,
		CallEndTime:   req.CallEndTime,
		RecordingURL:  req.RecordingURL,
	}
}
