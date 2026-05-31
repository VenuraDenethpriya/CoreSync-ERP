package mapper

import (
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"
)

// CustomerRequestToDomain converts a CreateCustomerRequest to a domain.Customer
func CustomerRequestToDomain(req *dto.CreateCustomerRequest) *domain.Customer {
	return &domain.Customer{
		Title:     req.Title,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Address:   req.Address,
		PhoneNo1:  req.PhoneNo1,
		PhoneNo2:  req.PhoneNo2,
		Email:     req.Email,
		VatNo:     req.VatNo,
		CreatedBy: req.CreatedBy,
	}
}

// CustomerResponseToDomain converts a CreateCustomerResponse to a domain.Customer
func CustomerResponseToDomain(req *dto.CreateCustomerResponse) *domain.Customer {
	return &domain.Customer{
		Title:     req.Title,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Address:   req.Address,
		PhoneNo1:  req.PhoneNo1,
		PhoneNo2:  req.PhoneNo2,
		Email:     req.Email,
		VatNo:     req.VatNo,
		CreatedBy: req.CreatedBy,
	}
}
func UpdateCustomerRequestToDomain(req *dto.UpdateCustomerRequest) *domain.Customer {
	return &domain.Customer{
		CustomerID: uuid.MustParse(req.CustomerID),
		Title:      req.Title,
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		Address:    req.Address,
		PhoneNo1:   req.PhoneNo1,
		PhoneNo2:   req.PhoneNo2,
		Email:      req.Email,
		VatNo:      req.VatNo,
	}
}
func UpdateCustomerResponseToDomain(req *dto.UpdateCustomerResponse) *domain.Customer {
	return &domain.Customer{
		CustomerID: req.CustomerID,
		Title:      req.Title,
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		Address:    req.Address,
		PhoneNo1:   req.PhoneNo1,
		PhoneNo2:   req.PhoneNo2,
		Email:      req.Email,
		VatNo:      req.VatNo,
		CreatedBy:  req.CreatedBy,
	}
}
func GetCustomerByPhoneNoRequestToDomain(req *dto.GetCustomerByPhoneNoRequest) *domain.Customer {
	return &domain.Customer{
		PhoneNo1: req.PhoneNo1,
	}
}
func GetCustomerByPhoneNoResponseToDomain(req *dto.GetCustomerByPhoneNoResponse) *domain.Customer {
	return &domain.Customer{
		CustomerID: req.CustomerID,
		Title:      req.Title,
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		Address:    req.Address,
		PhoneNo1:   req.PhoneNo1,
		PhoneNo2:   req.PhoneNo2,
		Email:      req.Email,
		VatNo:      req.VatNo,
	}
}
