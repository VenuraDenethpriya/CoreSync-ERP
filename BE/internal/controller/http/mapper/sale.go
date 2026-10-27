package mapper

import (
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/service/domain"
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
		Status:    req.Status,
		CreatedBy: req.CreatedBy,
	}
}

func UpdateSalespersonRequestToDomain(req *dto.UpdateSalespersonRequest) *domain.Salesperson {
	return &domain.Salesperson{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		PhoneNo:   req.PhoneNo,
		Email:     req.Email,
		Status:    req.Status,
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
func SaleTargetRequestToDomain(req *dto.CreateSalesTarget) *domain.SalesTarget {
	return &domain.SalesTarget{
		SalespersonID: req.SalespersonID,
		Month:         req.Month,
		Year:          req.Year,
		TargetAmount:  req.Amount,
		CreatedBy:     req.CreatedBy,
	}
}
