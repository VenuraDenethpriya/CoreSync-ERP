package mapper

import (
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/service/domain"

	"github.com/google/uuid"
)

// UserRequestToDomain converts a CreateUserRequest DTO to a User domain model.
func UserRequestToDomain(req *dto.CreateUserRequest) *domain.User {
	return &domain.User{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		ClerkID:   req.ClerkID,
		PhoneNo:   req.PhoneNo,
		Email:     req.Email,
		Role:      req.Role,
		CreatedBy: req.CreatedBy,
	}
}

// UserResponseToDomain converts a CreateUserResponse DTO to a User domain model.
func UserResponseToDomain(req *dto.CreateUserResponse) *domain.User {
	return &domain.User{
		ID:        req.ID,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		ClerkID:   req.ClerkID,
		PhoneNo:   req.PhoneNo,
		Email:     req.Email,
		Role:      req.Role,
		CreatedBy: req.CreatedBy,
	}
}

// UpdateUserRequestToDomain converts a UpdateUserRequest DTO to a User domain model.
func UpdateUserRequestToDomain(req *dto.UpdateUserRequest) *domain.User {
	return &domain.User{
		ID:        uuid.MustParse(req.UserID),
		FirstName: req.FirstName,
		LastName:  req.LastName,
		// ClerkID:   req.ClerkID,
		PhoneNo: req.PhoneNo,
		Email:   req.Email,
		Role:    req.Role,
	}
}
func UpdateUserResponseToDomain(req *dto.UpdateUserResponse) *domain.User {
	return &domain.User{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		ClerkID:   req.ClerkID,
		PhoneNo:   req.PhoneNo,
		Email:     req.Email,
		Role:      req.Role,
		CreatedBy: req.CreatedBy,
	}
}
